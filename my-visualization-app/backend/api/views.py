import os
from pathlib import Path

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from backend.server_handler.engine import Engine
from backend.server_handler.log_manager import export_logs
from django.http import JsonResponse
from backend.api.models import UploadedFile
from django.middleware.csrf import get_token
from rest_framework.views import APIView
import json
import pandas as pd
import sqlite3


# Define BASE_DIR to point to the project root directory.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class GetCsrfTokenView(APIView):
    """
    提供 CSRF Token 给前端
    """
    def get(self, request):
        csrf_token = get_token(request)  # 获取 CSRF Token
        return JsonResponse({"csrfToken": csrf_token})


@method_decorator(csrf_exempt, name='dispatch')
class HandleUserActionView(APIView):
    def post(self, request):
        """
        Handle user actions sent from the frontend and return a response.
        """
        try:
            # 获取前端传递的 JSON 数据
            body = json.loads(request.body)
            action = body.get("action", None)
            parameters = body.get("parameters", {})

            if not action:
                return JsonResponse({"error": "No action provided"}, status=400)

            # 根据用户操作执行相应的逻辑
            if action == "fetch_summary":
                # 示例：返回一个简单的摘要信息
                summary = {
                    "message": "Summary fetched successfully",
                    "details": parameters.get("details", "No details provided")
                }
                return JsonResponse(summary, status=200)
            elif action == "process_data":
                # 示例：处理数据逻辑
                data = parameters.get("data", [])
                if not data:
                    return JsonResponse({"error": "No data provided for processing"}, status=400)

                # 使用 Pandas 对数据进行简单处理
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
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file received"}, status=400)

        # 确保上传目录存在
        UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        file_path = os.path.join(UPLOAD_DIR, file.name)

        try:
            # 将文件保存到后端
            with open(file_path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            # 根据文件类型处理
            if file.name.lower().endswith(".csv"):
                file_instance = UploadedFile.objects.create(file=file, name=file.name, type="csv")
            elif file.name.lower().endswith(".xlsx"):
                file_instance = UploadedFile.objects.create(file=file, name=file.name, type="xlsx")
            else:
                return Response({"error": "Only CSV and XLSX files are supported"}, status=400)

            # 返回 dataset_id
            return_data = {
                "message": f"File '{file.name}' uploaded successfully.",
                "dataset_id": file_instance.id  # 返回唯一的 dataset_id
            }
            return Response(return_data, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)



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
        export_logs
"""
Code for frontend

const ExportLogsButton = () => {
  const handleExport = () => {
    //  GET for download CSV 
    const url = '/export_logs/';
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';  // download name
    a.click();  // 
  };

  return (
    <button onClick={handleExport}>
      Export Logs
    </button>
  );
};

export default ExportLogsButton;
"""

class FitCurveView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            x_feature = body.get("x_feature")
            y_feature = body.get("y_feature")
            method = body.get("method", "linear")  # 默认为线性拟合
            degree = body.get("degree", 2)  # 默认为二次多项式拟合
            initial_params = body.get("initial_params", None)  # 初始参数（如果是指数拟合）

            # 确保 dataset_id 存在
            if not dataset_id:
                return JsonResponse({"error": "File ID is required"}, status=400)

            # get file
            try:
                data_file = UploadedFile.objects.get(id=dataset_id)
            except UploadedFile.DoesNotExist:
                return JsonResponse({"error": "Dataset not found"}, status=404)

            # read file
            dataset_df = Engine.data_to_panda(data_file)

            # 调用 utility 中的拟合函数
            params, covariance, fitted_data = Engine.fit_curve(
                dataset_df, 
                x_feature, 
                y_feature, 
                method=method, 
                degree=degree, 
                initial_params=initial_params
            )

            # 返回拟合参数和拟合数据
            return JsonResponse({
                "params": params.tolist(),
                "covariance": covariance.tolist() if covariance is not None else None,
                "fitted_data": fitted_data.to_dict(orient='records')
            })

        except UploadedFile.DoesNotExist:
            return JsonResponse({"error": "File not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

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

            # Fetch the uploaded file by its ID
            dataset = UploadedFile.objects.get(id=dataset_id)
            
            # Convert the file to pandas DataFrame
            dataset_df = Engine.data_to_panda(dataset)
            
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
            
            # Return the interpolated data in JSON format
            return JsonResponse({"interpolated_data": interpolated_data.to_dict(orient='records')})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

class ExtrapolateView(APIView):
    def post(self, request):
        try:
            # Parse the request body
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")  # Get the ID of the uploaded file
            x_feature = body.get("x_feature")  # The column name for the x-axis
            y_feature = body.get("y_feature")  # The column name for the y-axis
            target_x = body.get("target_x")  # List of x values for extrapolation
            method = body.get("method", "linear")  # The type of extrapolation (linear, polynomial, exponential, spline)
            degree = body.get("degree", 2)  # Degree of polynomial for polynomial method

            # Fetch the uploaded file by its ID
            dataset = UploadedFile.objects.get(id=dataset_id)
            
            # Convert the file to pandas DataFrame
            dataset_df = Engine.data_to_panda(dataset)
            
            # Perform extrapolation
            extrapolated_data = Engine.extrapolate(
                dataset_df, 
                x_feature=x_feature, 
                y_feature=y_feature, 
                target_x=target_x, 
                method=method, 
                degree=degree
            )
            
            # Return the extrapolated data in JSON format
            return JsonResponse({"extrapolated_data": extrapolated_data.to_dict(orient='records')})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

class CorrelationView(APIView):
    def post(self, request):
        try:
            # Parse the request body
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")  # Get the ID of the uploaded file
            feature_1 = body.get("feature_1")  # The first feature/column to compare
            feature_2 = body.get("feature_2")  # The second feature/column to compare
            method = body.get("method", "pearson")  # The type of correlation ("pearson", "spearman", "kendall")

            # Fetch the uploaded file by its ID
            dataset = UploadedFile.objects.get(id=dataset_id)
            
            # Convert the file to pandas DataFrame
            dataset_df = Engine.data_to_panda(dataset)
            
            # Compute correlation
            correlation_value = Engine.compute_correlation(
                dataset_df, 
                feature_1=feature_1, 
                feature_2=feature_2, 
                method=method
            )
            
            # Return the correlation result as JSON
            return JsonResponse({"correlation": correlation_value})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

class DimensionalReductionView(APIView):
    def post(self, request):
        try:
            # Parse the request body
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")  # The ID of the uploaded file
            method = body.get("method", "PCA")  # The method for dimensional reduction ("PCA", "t-SNE", "LDA")
            n_components = body.get("n_components", 2)  # The number of components to reduce to

            # Fetch the uploaded file by its ID
            dataset = UploadedFile.objects.get(id=dataset_id)
            
            # Convert the file to pandas DataFrame
            dataset_df = Engine.data_to_panda(dataset)
            
            # Perform dimensional reduction
            reduced_data = Engine.dimensional_reduction(
                dataset_df, 
                method=method, 
                n_components=n_components
            )
            
            # Return the reduced data as a JSON response
            reduced_data_json = reduced_data.to_dict(orient="records")
            return JsonResponse({"reduced_data": reduced_data_json})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

class OversampleDataView(APIView):
    def post(self, request):
        try:
            # Parse the incoming JSON body
            body = json.loads(request.body)
            
            # Extract the relevant fields from the request
            dataset_id = body.get("dataset_id")  # Dataset ID to locate the file in the database
            x_feature = body.get("x_feature")  # Independent feature (column name)
            y_feature = body.get("y_feature")  # Dependent feature (column name)
            method = body.get("method", "linear")  # Interpolation method (default: linear)
            num_samples = body.get("num_samples", 100)  # Number of samples to generate (default: 100)
            degree = body.get("degree", 3)  # Polynomial degree (default: 3, used only for polynomial interpolation)

            # Fetch the uploaded file from the database
            dataset = UploadedFile.objects.get(id=dataset_id)
            
            # Convert the uploaded file to a pandas DataFrame using the existing method
            dataset_df = Engine.data_to_panda(dataset)
            
            # Perform oversampling (data interpolation)
            oversampled_data = Engine.oversample_data(
                dataset_df, 
                x_feature=x_feature, 
                y_feature=y_feature, 
                method=method, 
                num_samples=num_samples, 
                degree=degree
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