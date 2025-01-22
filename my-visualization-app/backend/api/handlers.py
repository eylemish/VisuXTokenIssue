from rest_framework.views import APIView
from rest_framework.response import Response
from .engine import Engine

class ServerHandler(APIView):
    def post(self, request, *args, **kwargs):
        try:
            data = request.data.get("data", [])
            engine = Engine()
            result = engine.process_data(data)
            return Response({"status": "success", "result": result})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)
