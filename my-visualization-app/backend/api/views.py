import os
from pathlib import Path

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import pandas as pd
import sqlite3


# 定义 BASE_DIR 指向项目根目录
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class DataVisualizationView(APIView):
    def post(self, request):
        # 获取数据
        data = request.data.get("data", [])
        if not data:
            return Response({"error": "No data provided"}, status=400)

        try:
            # 转换数据为 Pandas DataFrame
            df = pd.DataFrame(data)

            # 清理数据：确保所有列都是数值型
            df = df.apply(pd.to_numeric, errors='coerce')  # 非数值值转换为 NaN

            # 计算每列的均值和标准差
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
            return Response({"Error": "Please upload a file."}, status=400)

        # 使用 BASE_DIR 定义上传目录
        UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
        os.makedirs(UPLOAD_DIR, exist_ok=True)  # 如果目录不存在则创建
        file_path = os.path.join(UPLOAD_DIR, file.name)

        try:
            # 保存文件到服务器
            with open(file_path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            # 检查文件是否保存成功
            if not os.path.exists(file_path):
                return Response({"error": "File was not saved correctly."}, status=500)

            # 解析文件内容
            if file.name.lower().endswith(".csv"):
                df = pd.read_csv(file_path)
            elif file.name.lower().endswith(".xlsx"):
                df = pd.read_excel(file_path, engine="openpyxl")
            else:
                return Response({"Error": "Only CSV and XLSX files are supported"}, status=400)

            # 返回数据预览（前 5 行）
            data_preview = df.head().to_dict(orient="records")
            return Response({
                "message": f"File '{file.name}' uploaded successfully.",
                "file_path": file_path,
                "data_preview": data_preview
            })
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
