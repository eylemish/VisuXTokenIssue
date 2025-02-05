from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
import pandas as pd
import json
import sqlite3

class DataVisualizationView(APIView):
    def post(self, request):
        # Get data
        data = request.data.get("data", [])
        if not data:
            return Response({"error": "No data provided"}, status=400)

        try:
            # Transfer data into Pandas DataFrame
            df = pd.DataFrame(data)

            # Clean the data: ensure that all columns are of numeric type
            df = df.apply(pd.to_numeric, errors='coerce')  # Convert non-numeric values to NaN

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

class AddDataView(APIView):
    def post(self, request):
        table_name = "uploaded_data"
        new_data = request.data.get("new_data", {})

        if not new_data:
            return Response({"error": "No data provided"}, status=400)

        try:
            conn = sqlite3.connect("database.sqlite3")
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
