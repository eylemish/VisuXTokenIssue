from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json

class FindLettersView(APIView):
    """
    Accepts a POST request with a text, finds and returns the unique letters.
    """

    def post(self, request):
        try:
            
            data = json.loads(request.body)
            text = data.get("text", "")

            letters = sorted(set(filter(str.isalpha, text)))

            return Response({"letters": letters}, status=status.HTTP_200_OK)

        except json.JSONDecodeError:
            return Response({"error": "Not a valid JSON format"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Only POST requests are allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
