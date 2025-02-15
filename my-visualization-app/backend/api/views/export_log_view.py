from rest_framework.response import Response
from backend.server_handler.log_manager import export_logs
from rest_framework.views import APIView

class ExportLogView(APIView):
    def post(self, request):
        # Get uploaded_file_id from request data
        uploaded_file_id = request.data.get("uploaded_file_id")

        if not uploaded_file_id:
            return Response({"error": "uploaded_file_id is required"}, status=400)

        export_logs(uploaded_file_id)