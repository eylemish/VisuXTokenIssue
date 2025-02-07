import csv
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import AuditLog


def log_action(tool_type, params):
    #log actions from user
    AuditLog.objects.create(tool_type=tool_type, params=params)

@csrf_exempt  # If you are using a separated frontend and backend, you may need to disable CSRF.
def revert_log(log_id):
    # undo logs
    log_entry = get_object_or_404(AuditLog, id=log_id)

    if log_entry.revert():
        return JsonResponse({"message": "log reverted successfully"})
    else:
        return JsonResponse({"error": "log revert failed"}, status=403)

def export_logs(request):
    # export logs
    logs = AuditLog.objects.filter(user=request.user, is_reverted=False)

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="audit_logs.csv"'

    writer = csv.writer(response)
    writer.writerow(["Timestamp", "Tool", "Params"])

    for log in logs:
        writer.writerow([log.timestamp, log.tool_type, log.params])

    return response