import os
from pathlib import Path

from rest_framework import status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from backend.api.serializers import DatasetSerializer
from backend.server_handler.engine import Engine
from backend.server_handler.log_manager import export_logs
from django.http import JsonResponse
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

# @method_decorator(csrf_exempt, name='dispatch')
# class UploadView(APIView):
#     parser_classes = [MultiPartParser]
#
#     def post(self, request, *args, **kwargs):
#         file = request.FILES.get("file")
#         if not file:
#             return Response({"error": "No file received"}, status=400)
#
#         # Ensure that the upload directory exists
#         UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
#         os.makedirs(UPLOAD_DIR, exist_ok=True)
#
#         file_path = os.path.join(UPLOAD_DIR, file.name)
#
#         try:
#             # Save files to the back-end
#             with open(file_path, "wb") as f:
#                 for chunk in file.chunks():
#                     f.write(chunk)
#
#             # Processed according to document type
#             if file.name.lower().endswith(".csv"):
#                 file_instance = Dataset.objects.create(name=file.name, features=[], records=[])
#                 df = pd.read_csv(file)
#                 file_instance.features = list(df.columns)
#                 file_instance.records = df.to_dict(orient="records")
#                 file_instance.save()
#             elif file.name.lower().endswith(".xlsx"):
#                 file_instance = Dataset.objects.create(name=file.name, features=[], records=[])
#                 df = pd.read_excel(file)
#                 file_instance.features = list(df.columns)
#                 file_instance.records = df.to_dict(orient="records")
#                 file_instance.save()
#             else:
#                 return Response({"error": "Only CSV and XLSX files are supported"}, status=400)
#
#             # Return dataset_id
#             return_data = {
#                 "message": f"File '{file.name}' uploaded successfully.",
#                 "dataset_id": file_instance.id
#             }
#             return Response(return_data, status=201)
#
#         except Exception as e:
#             print("error:", str(e))
#             return Response({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class UploadDatasetView(APIView):
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
            method = body.get("method", "linear")  # Default is linear
            degree = body.get("degree", 2)  # Default degree is 2
            initial_params = body.get("initial_params", None) 

            # Make sure that dataset_id exist
            if not dataset_id:
                return JsonResponse({"error": "File ID is required"}, status=400)

            # get file
            try:
                data_file = UploadedFile.objects.get(id=dataset_id)
            except UploadedFile.DoesNotExist:
                return JsonResponse({"error": "Dataset not found"}, status=404)

            # read file
            dataset_df = Engine.data_to_panda(data_file)

            params, covariance, fitted_data = Engine.fit_curve(
                dataset_df, 
                x_feature, 
                y_feature, 
                method=method, 
                degree=degree, 
                initial_params=initial_params
            )

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

@method_decorator(csrf_exempt, name="dispatch")
class DimensionalReductionView(APIView):
    def post(self, request):
        try:
            # Parsing the request body
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            method = body.get("method", "pca").lower()  # Unified lowercase to prevent case mismatch
            n_components = body.get("n_components", 2)

            # Allow only supported methods
            valid_methods = ["pca", "tsne", "umap"]
            if method not in valid_methods:
                return JsonResponse({"error": f"Invalid dimensional reduction method. Choose from {valid_methods}."}, status=400)

            # Ensure dataset_id exists
            if not dataset_id:
                return JsonResponse({"error": "Missing dataset_id."}, status=400)

            try:
                dataset = UploadedFile.objects.get(id=dataset_id)
            except UploadedFile.DoesNotExist:
                return JsonResponse({"error": f"Dataset with ID {dataset_id} not found."}, status=404)

            # Converting data
            dataset_df = Engine.data_to_panda(dataset_id)

            # Perform dim reduction
            reduced_data = Engine.dimensional_reduction(
                dataset_df,
                method=method,
                n_components=n_components
            )

            # return
            reduced_data_json = reduced_data.to_dict(orient="records")
            return JsonResponse({"reduced_data": reduced_data_json}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

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
