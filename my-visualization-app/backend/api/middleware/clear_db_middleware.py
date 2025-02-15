from django.utils.deprecation import MiddlewareMixin
from django.db import connection

class ClearDatabaseMiddleware(MiddlewareMixin):
    """Empty database tables and reset self-incrementing IDs on every page refresh"""

    def process_request(self, request):
        tables_to_clear = [
            "api_uploadedfile",
            "api_dataset",
            "api_auditlog",
            "api_analysisresult"
        ]

        with connection.cursor() as cursor:
            for table in tables_to_clear:
                cursor.execute(f"DELETE FROM {table};")  # Empty table data
                cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}';")  # Reset ID Count

        return None
