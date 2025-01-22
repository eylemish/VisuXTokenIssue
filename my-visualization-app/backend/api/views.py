from rest_framework.views import APIView
from rest_framework.response import Response
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

            # make sure that all the columns are int
            df = df.apply(pd.to_numeric, errors='coerce')  # transfer the not-int data into NaN

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
