import os
from pathlib import Path

from rest_framework import status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404

from backend.api.serializers import DatasetSerializer
from backend.server_handler.engine import Engine
from backend.server_handler.log_manager import export_logs
from django.http import JsonResponse, HttpResponse
from backend.api.models import UploadedFile, Dataset
from django.middleware.csrf import get_token
from rest_framework.views import APIView
import json
import pandas as pd
import sqlite3


# Define BASE_DIR to point to the project root directory.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class GetCsrfTokenView(APIView):
    """
    Provide CSRF token
    """
    def get(self, request):
        csrf_token = get_token(request)  # Get CSRF Token
        print(f"Returning CSRF Token: {csrf_token}")
        return JsonResponse({"csrfToken": csrf_token})


@method_decorator(csrf_exempt, name='dispatch')
class HandleUserActionView(APIView):
    def post(self, request):
        """
        Handle user actions sent from the frontend and return a response.
        """
        try:
            # Get JSON data from frontend
            body = json.loads(request.body)
            action = body.get("action", None)
            parameters = body.get("parameters", {})

            if not action:
                return JsonResponse({"error": "No action provided"}, status=400)
                
            if action == "fetch_summary":
                summary = {
                    "message": "Summary fetched successfully",
                    "details": parameters.get("details", "No details provided")
                }
                return JsonResponse(summary, status=200)
            elif action == "process_data":
                data = parameters.get("data", [])
                if not data:
                    return JsonResponse({"error": "No data provided for processing"}, status=400)

                # Use pandas to process data
                df = pd.DataFrame(data)
                result = {
                    "columns": df.columns.tolist(),
                    "mean": df.mean().tolist(),
                    "std": df.std().tolist()
                }
                return JsonResponse({"message": "Data processed successfully", "result": result}, status=200)
            else:
                return JsonResponse({"error": f"Unknown action: {action}"}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

class DataVisualizationView(APIView):
    def post(self, request):
        # Getting data
        data = request.data.get("data", [])
        if not data:
            return Response({"error": "No data provided"}, status=400)

        try:
            # Convert data to Pandas DataFrame
            df = pd.DataFrame(data)

            # Cleaning up the data: making sure all columns are numeric
            df = df.apply(pd.to_numeric, errors='coerce')

            # Calculate the mean and standard deviation for each column
            summary = {
                "columns": df.columns.tolist(),
                "mean": df.mean().tolist(),
                "std": df.std().tolist(),
            }

            return Response(summary)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class UploadView(APIView):
    """
    上传文件并解析成数据集，存入 Dataset 数据库
    """
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file received"}, status=status.HTTP_400_BAD_REQUEST)

        # 确保上传目录存在
        UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        file_path = os.path.join(UPLOAD_DIR, file.name)

        try:
            # ✅ 保存文件到后端
            with open(file_path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            # ✅ 解析 CSV / Excel 文件
            if file.name.lower().endswith(".csv"):
                df = pd.read_csv(file_path)
                file_type = "csv"
            elif file.name.lower().endswith(".xlsx"):
                df = pd.read_excel(file_path)
                file_type = "xlsx"
            else:
                return Response({"error": "Only CSV and XLSX files are supported"}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ 提取列名 & 数据记录
            features = list(df.columns)
            records = df.to_dict(orient="records")

            # ✅ 存入数据库 Dataset
            dataset = Dataset.objects.create(
                name=file.name,
                features=features,
                records=records
            )

            # ✅ 可选：存入 UploadedFile 记录
            file_instance = UploadedFile.objects.create(
                file_path=file_path, name=file.name, file_type=file_type
            )

            return Response(
                {"message": f"File '{file.name}' uploaded and stored successfully.", "dataset_id": dataset.id},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            print("error:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class DownloadView(APIView):
    def get(self, request, dataset_id, file_format, *args, **kwargs):
        print(f"Received dataset_id={dataset_id}, file_format={file_format}")  # 调试信息

        # 获取指定数据集
        dataset = get_object_or_404(Dataset, id=dataset_id)

        # 确保 `features` 和 `records` 存在
        features = dataset.features if hasattr(dataset, "features") else []
        records = dataset.records if hasattr(dataset, "records") else []

        df = pd.DataFrame(records, columns=features)

        if file_format == "csv":
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{dataset.name}.csv"'
            df.to_csv(response, index=False)
        elif file_format == "json":
            response = HttpResponse(json.dumps(records, indent=2), content_type='application/json')
            response['Content-Disposition'] = f'attachment; filename="{dataset.name}.json"'
        elif file_format == "xlsx":
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="{dataset.name}.xlsx"'
            with pd.ExcelWriter(response, engine='xlsxwriter') as writer:
                df.to_excel(writer, index=False, sheet_name="Data")
        else:
            return JsonResponse({"error": "Unsupported format"}, status=400)

        return response


@method_decorator(csrf_exempt, name='dispatch')
class DatasetDetailView(APIView):
    """
    Get full dataset (data + column names)
    """
    def get(self, request, dataset_id):
        try:
            dataset = Dataset.objects.get(id=dataset_id)
            serializer = DatasetSerializer(dataset)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class DatasetColumnsView(APIView):
    """
    Get only the column names of the dataset
    """
    def get(self, request, dataset_id):
        try:
            dataset = Dataset.objects.get(id=dataset_id)
            return Response({"columns": dataset.features}, status=status.HTTP_200_OK)
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class UploadDatasetView(APIView):
    """
    Uploading data sets and storing them in the database
    """
    def post(self, request):
        serializer = DatasetSerializer(data=request.data)

        if serializer.is_valid():
            dataset = serializer.save()  # save dataset
            return Response(
                {"message": "Dataset uploaded successfully!", "dataset_id": dataset.id},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class ChangeDataView(APIView):
    def post(self, request, dataset_id):
        """
        Create a copy of the Dataset, modify it, and return the updated version.
        """
        dataset = get_object_or_404(Dataset, id=dataset_id)

        # Create a copy of the dataset
        new_dataset = dataset.copy_dataset()

        # Get modification parameters
        modifications = request.POST.get("modifications", "{}")  # Expecting JSON format
        try:
            modifications = json.loads(modifications)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

        # Modify features
        if "features" in modifications:
            new_dataset.features = modifications["features"]

        # Modify records
        if "records" in modifications:
            new_dataset.records = modifications["records"]

        new_dataset.save()

        return JsonResponse({
            "message": "Dataset copied and modified successfully",
            "dataset_id": new_dataset.id,
            "name": new_dataset.name,
            "features": new_dataset.features,
            "records": new_dataset.records
        })

class AddDataView(APIView):
    def post(self, request):
        table_name = "uploaded_data"
        new_data = request.data.get("new_data", {})

        if not new_data:
            return Response({"error": "No data provided"}, status=400)

        try:
            conn = sqlite3.connect(os.path.join(BASE_DIR, "database.sqlite3"))
            df = pd.read_sql(f"SELECT * FROM {table_name} LIMIT 1", conn)

            if set(df.columns) != set(new_data.keys()):
                conn.close()
                return Response({"error": "Column mismatch"}, status=400)

            new_df = pd.DataFrame([new_data])
            new_df.to_sql(table_name, conn, if_exists="append", index=False)
            conn.close()

            return Response({"message": "Data added successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class ExportLogView(APIView):
    def post(self, request):
        # Get uploaded_file_id from request data
        uploaded_file_id = request.data.get("uploaded_file_id")

        if not uploaded_file_id:
            return Response({"error": "uploaded_file_id is required"}, status=400)
            
        export_logs(uploaded_file_id)

@method_decorator(csrf_exempt, name='dispatch')
class FitCurveView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            params = body.get("params", {})
            x_feature = params.get("xColumn")  # 从 params 读取 x 特征
            y_feature = params.get("yColumn")  # 从 params 读取 y 特征
            method = params.get("type", "linear")  # 从 params 读取 method，默认 "linear"
            degree = params.get("degree", 2)  # 从 params 读取 degree，默认 2
            initial_params = params.get("initial_params", None)
            # Ensure dataset_id is provided
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)
            # Get the dataset object
            dataset = get_object_or_404(Dataset, id=dataset_id)
            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()
            # Ensure required features exist in the dataset
            if x_feature not in dataset_df.columns or y_feature not in dataset_df.columns:
                return JsonResponse({"error": "Specified features not found in dataset"}, status=400)
            # Perform curve fitting using Engine
            params, covariance, fitted_data = Engine.fit_curve(
                dataset_df, 
                x_feature, 
                y_feature, 
                method=method, 
                degree=degree, 
                initial_params=initial_params
            )
            # Create original data array with x_feature and y_feature values
            original_data = dataset_df[[x_feature, y_feature]].rename(columns={x_feature: 'x', y_feature: 'y'}).to_dict(orient='records')
            return JsonResponse({
                "params": params.tolist(),
                "covariance": covariance.tolist() if covariance is not None else None,
                "generated_data": fitted_data.to_dict(orient='records'),
                "original_data": original_data
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class InterpolateView(APIView):
    def post(self, request):
        try:
            # Parse the request body
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")  # Get the ID of the uploaded file
            x_feature = body.get("x_feature")  # The column name for the x-axis
            y_feature = body.get("y_feature")  # The column name for the y-axis
            kind = body.get("kind", "linear")  # The type of interpolation (linear, polynomial, spline, exponential)
            num_points = body.get("num_points", 100)  # Number of data points to generate
            min_value = body.get("min_value", None)  # Minimum x value for interpolation (optional)
            max_value = body.get("max_value", None)  # Maximum x value for interpolation (optional)

            # Ensure dataset_id is provided
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)

            # Get the dataset object
            dataset = get_object_or_404(Dataset, id=dataset_id)

            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()
            # Perform interpolation
            interpolated_data = Engine.interpolate(
                dataset_df, 
                x_feature=x_feature, 
                y_feature=y_feature, 
                kind=kind, 
                num_points=num_points, 
                min_value=min_value, 
                max_value=max_value
            )
            print(interpolated_data)
            # Return the interpolated data in JSON format
            return JsonResponse({"interpolated_data": interpolated_data.to_dict(orient='records')})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class ExtrapolateView(APIView):
    def post(self, request):
        try:
            # Parse the JSON data sent from the frontend
            request_data = json.loads(request.body)
            # Extract fields from the request data
            dataset_id = request_data.get('dataset_id')
            x_feature = request_data.get('x_feature')
            y_feature = request_data.get('y_feature')
            method = request_data.get('kind')
            extrapolate_range = request_data.get('params', {}).get('extrapolateRange', [])

            # Ensure that the request data is valid
            if not dataset_id or not x_feature or not y_feature or not method or not extrapolate_range:
                return JsonResponse({"error": "Missing required parameters"}, status=400)

            # Retrieve the dataset
            dataset = Dataset.objects.get(id=dataset_id)
            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()

            # Call the extrapolate function to perform extrapolation
            extrapolated_data = Engine.extrapolate(
                data=dataset_df,
                x_feature=x_feature,
                y_feature=y_feature,
                target_x=extrapolate_range,
                method=method
            )

            # Convert the DataFrame to a dictionary and return it to the frontend
            result = extrapolated_data.to_dict(orient='records')

            return JsonResponse({"original_data": dataset_df.to_dict(orient='records'), "extrapolated_data": result})

        except Exception as e:
            # Catch exceptions and return an error message
            return JsonResponse({"error": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class CorrelationView(APIView):
    def post(self, request):
        try:
            # 解析请求 JSON
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")  # 获取数据集 ID
            selected_features = body.get("features", [])  # 获取用户选择的列
            method = body.get("method", "pearson")  # 相关性计算方法（默认 Pearson）

            # 确保 `dataset_id` 存在
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)

            # 获取数据集对象
            dataset = get_object_or_404(Dataset, id=dataset_id)  # 用 `id` 代替 `dataset_id`

            # 将数据集转换为 Pandas DataFrame
            df = dataset.get_dataframe()

            # 确保选中的列在 DataFrame 中
            if not all(feature in df.columns for feature in selected_features):
                return JsonResponse({"error": "One or more selected features are missing from the dataset"}, status=400)

            # 计算相关性矩阵
            correlation_matrix = df[selected_features].corr(method=method)

            # 将相关性矩阵转换为 JSON 格式
            result = {
                "columns": correlation_matrix.columns.tolist(),  # X/Y 轴的列名
                "values": correlation_matrix.values.tolist(),  # 相关性矩阵的值
            }

            return JsonResponse({"correlation_matrix": result})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name="dispatch")
class DimensionalReductionView(APIView):
    def post(self, request):
        try:
            # 解析请求体
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            method = body.get("method", "pca").lower()  # 统一小写，避免大小写不匹配
            n_components = body.get("n_components", 2)

            # 允许的降维方法
            valid_methods = ["pca", "tsne", "umap"]
            if method not in valid_methods:
                return JsonResponse({"error": f"Invalid dimensionality reduction method. Choose from {valid_methods}."}, status=400)

            # 确保 dataset_id 存在
            if not dataset_id:
                return JsonResponse({"error": "Missing dataset_id."}, status=400)

            try:
                # **✅ 从 `Dataset` 获取数据，而不是 `UploadedFile`**
                dataset = Dataset.objects.get(id=int(dataset_id))
            except (Dataset.DoesNotExist, ValueError):
                return JsonResponse({"error": f"Dataset with ID {dataset_id} not found or invalid."}, status=404)

            # **✅ 获取 DataFrame**
            dataset_df = dataset.get_dataframe()
            if dataset_df.empty:
                return JsonResponse({"error": "Dataset is empty or invalid."}, status=400)

            # **✅ 进行降维**
            reduced_data = Engine.dimensional_reduction(
                dataset_df,
                method=method,
                n_components=n_components
            )

            # 返回数据
            reduced_data_json = reduced_data.to_dict(orient="records")
            return JsonResponse({"reduced_data": reduced_data_json}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class OversampleDataView(APIView):
    def post(self, request):
        try:
            # Parse the incoming JSON body
            body = json.loads(request.body)
            
            # Extract the relevant fields from the request
            dataset_id = body.get("datasetId")  # Dataset ID to locate the file in the database
            params = body.get("params", {})
            x_feature = params.get("xColumn")  # get x column from params
            y_feature = params.get("yColumn")  # get y column from params
            method = params.get("method", "smote")  # Oversample method (default: smote)
            oversample_factor = params.get("num_samples", 1)  # Oversampling factor (default: 1)

            # Ensure dataset_id is provided
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)

            # Get the dataset object
            dataset = get_object_or_404(Dataset, id=dataset_id)

            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()
            
            # Perform oversampling (data interpolation)
            oversampled_data = Engine.oversample_data(
                dataset_df, 
                x_feature=x_feature, 
                y_feature=y_feature, 
                method=method, 
                oversample_factor = oversample_factor
            )
            
            # Convert the oversampled data to a dictionary for easy JSON response
            oversampled_data_json = oversampled_data.to_dict(orient="records")
            
            # Return the oversampled data as a JSON response
            return JsonResponse({"oversampled_data": oversampled_data_json})

        except Exception as e:
            # If any error occurs, return an error response with the exception message
            return JsonResponse({"error": str(e)}, status=400)

class ApplyPcaView(APIView):
    def post(self,request):
        try:
            body = json.loads(request.body)
            dataset = body.get("dataset", [])
            n_components = body.get("n_components", 2)

            if not dataset:
                return JsonResponse({"error": "dataset empty"}, status=400)

            dataset_df = pd.DataFrame(dataset)
            transformed_df = Engine.apply_pca(dataset_df, n_components=n_components)

            return JsonResponse({
                "pca_result": transformed_df.to_dict(orient="records")
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

class SuggestFeatureDroppingView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")  
            correlation_threshold = float(body.get("correlation_threshold", 0.95))
            variance_threshold = float(body.get("variance_threshold", 0.01))

            if not dataset_id:
                return JsonResponse({"error": "Missing dataset_id"}, status=400)

            uploaded_file = UploadedFile.objects.get(id=dataset_id)
            df = Engine.data_to_panda(uploaded_file)

            features_to_drop = Engine.suggest_feature_dropping(
                df, 
                correlation_threshold=correlation_threshold, 
                variance_threshold=variance_threshold
            )

            return JsonResponse({"features_to_drop": features_to_drop})

        except UploadedFile.DoesNotExist:
            return JsonResponse({"error": "Dataset not found"}, status=404)
        except ValueError as ve:
            return JsonResponse({"error": f"Invalid parameter: {str(ve)}"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

class SuggestFeatureCombiningView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            correlation_threshold = body.get("correlation_threshold", 0.9)

            if not dataset_id:
                return JsonResponse({"error": "Missing dataset_id"}, status=400)

            # get file
            try:
                data_file = UploadedFile.objects.get(id=dataset_id)
            except UploadedFile.DoesNotExist:
                return JsonResponse({"error": "Dataset not found"}, status=404)

            # read file
            dataset_df = Engine.data_to_panda(data_file)

            feature_combinations = Engine.suggest_feature_combining(
                dataset_df,
                correlation_threshold=correlation_threshold
            )

            return JsonResponse({"feature_combinations": feature_combinations})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
