from rest_framework.views import APIView
from rest_framework.response import Response
import pandas as pd

class DataVisualizationView(APIView):
    def post(self, request):
        # 获取数据
        data = request.data.get("data", [])
        if not data:
            return Response({"error": "No data provided"}, status=400)

        # 将数据转换为 Pandas DataFrame
        df = pd.DataFrame(data)

        # 简单统计：计算每列的均值和标准差
        summary = {
            "columns": df.columns.tolist(),
            "mean": df.mean().tolist(),
            "std": df.std().tolist(),
        }

        return Response(summary)
