from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
import pandas as pd

class DataVisualizationView(APIView):
    def post(self, request):
        # Get data
        data = request.data.get("data", [])
        if not data:
            return Response({"error": "No data provided"}, status=400)

        try:
            # Transfer data into Pandas DataFrame
            df = pd.DataFrame(data)

            # 清洗数据：确保所有列是数值类型 e
            df = df.apply(pd.to_numeric, errors='coerce')  # 转换非数值为 NaN

            # Calculate the mean and standard deviation for each column.
            summary = {
                "columns": df.columns.tolist(),
                "mean": df.mean().tolist(),
                "std": df.std().tolist(),
            }

            return Response(summary)
        except Exception as e:
            # catch error and return false message
            return Response({"error": str(e)}, status=500)

class UploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get("file")

        if not file:
            return Response({"Error": "Please upload a file."}, status = 400)
        #Accept CSV and XLSX files
        filename = file.name.lower()
        if filename.endswith(".csv"):
            df = pd.read_csv(file)
        if filename.endswith(".xlsx"):
            df = pd.read_excel(file, engine="openpyxl")
        else:
            return Response({"Error": "Only support files in CSV or XLSX"}, status=400)
        data = df.to_dict(orient="records")

        return Response({"message": "Success", "data": data})
