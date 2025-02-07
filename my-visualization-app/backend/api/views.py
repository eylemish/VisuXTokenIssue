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
import json
import pandas as pd
import sqlite3


# Define BASE_DIR to point to the project root directory.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

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

        UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        file_path = os.path.join(UPLOAD_DIR, file.name)

        try:
            with open(file_path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)


            if file.name.lower().endswith(".csv"):
                file_instance = UploadedFile.objects.create(file = file, name = file.name, type = "csv")
                df = pd.read_csv(file_path)
            elif file.name.lower().endswith(".xlsx"):
                file_instance = UploadedFile.objects.create(file = file, name = file.name, type = "xlsx")
                df = pd.read_excel(file_path, engine="openpyxl")
            else:
                return Response({"error": "Only CSV and XLSX files are supported"}, status=400)

            data_preview = df.head().to_dict(orient="records")

            return_data = {
                "message": f"File '{file.name}' uploaded successfully.",
                "file_path": file_path,
                "data_preview": data_preview
            }

            return Response(return_data)

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
            dataset = body.get("dataset", [])
            correlation_threshold = body.get("correlation_threshold", 0.95)
            variance_threshold = body.get("variance_threshold", 0.01)

            if not dataset:
                return JsonResponse({"error": "empty dataset"}, status=400)

            dataset_df = pd.DataFrame(dataset)
            features_to_drop = Engine.suggest_feature_dropping(
                dataset_df,
                correlation_threshold=correlation_threshold,
                variance_threshold=variance_threshold
            )

            return JsonResponse({"features_to_drop": features_to_drop})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

class SuggestFeatureCombiningView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset = body.get("dataset", [])
            correlation_threshold = body.get("correlation_threshold", 0.9)

            if not dataset:
                return JsonResponse({"error": "empty dataset"}, status=400)

            dataset_df = pd.DataFrame(dataset)
            feature_combinations = Engine.suggest_feature_combining(
                dataset_df,
                correlation_threshold=correlation_threshold
            )

            return JsonResponse({"feature_combinations": feature_combinations})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)