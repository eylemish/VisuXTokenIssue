from rest_framework.views import APIView
from rest_framework.response import Response
import pandas as pd

class DataVisualizationView(APIView):
    def post(self, request):
        # 获取数据
        data = request.data.get("data", [])
        if not data:
            return Response({"error": "No data provided"}, status=400)

        try:
            # 将数据转换为 Pandas DataFrame
            df = pd.DataFrame(data)

            # 清洗数据：确保所有列是数值类型 e
            df = df.apply(pd.to_numeric, errors='coerce')  # 转换非数值为 NaN

            # 简单统计：计算每列的均值和标准差
            summary = {
                "columns": df.columns.tolist(),
                "mean": df.mean().tolist(),
                "std": df.std().tolist(),
            }

            return Response(summary)
        except Exception as e:
            # 捕捉异常并返回错误信息
            return Response({"error": str(e)}, status=500)
