# from django.http import JsonResponse
# from django.middleware.csrf import get_token
# from rest_framework.views import APIView
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator

# @method_decorator(csrf_exempt, name='dispatch')
# class GetCsrfTokenView(APIView):
#     """
#     Provide CSRF token
#     """

#     def get(self, request):
#         csrf_token = get_token(request)  # Get CSRF Token
#         print(f"Returning CSRF Token: {csrf_token}")
#         return JsonResponse({"csrfToken": csrf_token})
