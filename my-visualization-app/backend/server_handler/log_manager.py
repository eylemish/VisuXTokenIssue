import csv
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.http import JsonResponse

from backend.api.models import AuditLog
from backend.api.models import UploadedFile


def log_action(tool_type, params):
    #log actions from user
    AuditLog.objects.create(tool_type=tool_type, params=params)

 # If you are using a separated frontend and backend, you may need to disable CSRF.
def revert_log(log_id):
    # undo logs
    log_entry = get_object_or_404(AuditLog, id=log_id)

    if log_entry.revert():
        return JsonResponse({"message": "log reverted successfully"})
    else:
        return JsonResponse({"error": "log revert failed"}, status=403)

def export_logs(uploaded_file_id):
    # Retrieve the specified UploadedFile instance
    uploaded_file = get_object_or_404(UploadedFile, id=uploaded_file_id)

    # Retrieve all AuditLog records associated with this UploadedFile
    logs = uploaded_file.audit_logs.all()

    # Create an HTTP response object with the appropriate CSV header
    response = HttpResponse(content_type='text/csv')
    # Set the Content-Disposition header to suggest a filename based on the uploaded file's name
    response['Content-Disposition'] = f'attachment; filename="{uploaded_file.name}_audit_logs.csv"'

    # Create a CSV writer
    writer = csv.writer(response)
    # Write the CSV header row
    writer.writerow(["Timestamp", "Tool", "Params"])

    # Write each log record to the CSV
    for log in logs:
        writer.writerow([log.timestamp, log.tool_type, log.params])

    return response