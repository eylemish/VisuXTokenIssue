from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from backend.server_handler.engine import Engine
from django.http import JsonResponse
from backend.api.models import UploadedFile, Dataset
from rest_framework.views import APIView
import json
import pandas as pd

@method_decorator(csrf_exempt, name='dispatch')
class FitCurveView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            params = body.get("params", {})
            x_feature = params.get("xColumn")  # 从 params 读取 x 特征
            y_feature = params.get("yColumn")  # 从 params 读取 y 特征
            method = params.get("type", "linear")  # 从 params 读取 method，默认 "linear"
            degree = params.get("degree", 2)  # 从 params 读取 degree，默认 2
            initial_params = params.get("initial_params", None)
            # Ensure dataset_id is provided
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)
            # Get the dataset object
            dataset = get_object_or_404(Dataset, id=dataset_id)
            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()
            # Ensure required features exist in the dataset
            if x_feature not in dataset_df.columns or y_feature not in dataset_df.columns:
                return JsonResponse({"error": "Specified features not found in dataset"}, status=400)
            # Perform curve fitting using Engine
            params, covariance, fitted_data = Engine.fit_curve(
                dataset_df,
                x_feature,
                y_feature,
                method=method,
                degree=degree,
                initial_params=initial_params
            )
            # Create original data array with x_feature and y_feature values
            original_data = dataset_df[[x_feature, y_feature]].rename(columns={x_feature: 'x', y_feature: 'y'}).to_dict(
                orient='records')
            return JsonResponse({
                "params": params.tolist(),
                "covariance": covariance.tolist() if covariance is not None else None,
                "generated_data": fitted_data.to_dict(orient='records'),
                "original_data": original_data
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class InterpolateView(APIView):
    def post(self, request):
        try:
            # Parse the request body
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")  # Get the ID of the uploaded file
            x_feature = body.get("x_feature")  # The column name for the x-axis
            y_feature = body.get("y_feature")  # The column name for the y-axis
            kind = body.get("kind", "linear")  # The type of interpolation (linear, polynomial, spline, exponential)
            num_points = body.get("numPoints") or 100  # Default to 100 if null
            min_value = body.get("minValue", None)  # Minimum x value for interpolation (optional)
            max_value = body.get("maxValue", None)  # Maximum x value for interpolation (optional)

            # Ensure dataset_id is provided
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)

            # Get the dataset object
            dataset = get_object_or_404(Dataset, id=dataset_id)

            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()
            # Perform interpolation
            interpolated_data = Engine.interpolate(
                dataset_df,
                x_feature=x_feature,
                y_feature=y_feature,
                kind=kind,
                num_points=num_points,
                min_value=min_value,
                max_value=max_value
            )
            print(interpolated_data)
            # Return the interpolated data in JSON format
            return JsonResponse({"interpolated_data": interpolated_data.to_dict(orient='records')})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class ExtrapolateView(APIView):
    def post(self, request):
        try:
            # Parse the JSON data sent from the frontend
            request_data = json.loads(request.body)
            # Extract fields from the request data
            dataset_id = request_data.get('dataset_id')
            x_feature = request_data.get('x_feature')
            y_feature = request_data.get('y_feature')
            method = request_data.get('kind')
            extrapolate_range = request_data.get('params', {}).get('extrapolateRange', [])

            # Ensure that the request data is valid
            if not dataset_id or not x_feature or not y_feature or not method or not extrapolate_range:
                return JsonResponse({"error": "Missing required parameters"}, status=400)

            # Retrieve the dataset
            dataset = Dataset.objects.get(id=dataset_id)
            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()

            # Call the extrapolate function to perform extrapolation
            extrapolated_data = Engine.extrapolate(
                data=dataset_df,
                x_feature=x_feature,
                y_feature=y_feature,
                target_x=extrapolate_range,
                method=method
            )

            # Convert the DataFrame to a dictionary and return it to the frontend
            result = extrapolated_data.to_dict(orient='records')

            return JsonResponse({"original_data": dataset_df.to_dict(orient='records'), "extrapolated_data": result})

        except Exception as e:
            # Catch exceptions and return an error message
            return JsonResponse({"error": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class CorrelationView(APIView):
    def post(self, request):
        try:
            # 解析请求 JSON
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")  # 获取数据集 ID
            selected_features = body.get("features", [])  # 获取用户选择的列
            method = body.get("method", "pearson")  # 相关性计算方法（默认 Pearson）

            # 确保 `dataset_id` 存在
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)

            # 获取数据集对象
            dataset = get_object_or_404(Dataset, id=dataset_id)  # 用 `id` 代替 `dataset_id`

            # 将数据集转换为 Pandas DataFrame
            df = dataset.get_dataframe()

            # 确保选中的列在 DataFrame 中
            if not all(feature in df.columns for feature in selected_features):
                return JsonResponse({"error": "One or more selected features are missing from the dataset"}, status=400)

            # 计算相关性矩阵
            correlation_matrix = df[selected_features].corr(method=method)

            # 将相关性矩阵转换为 JSON 格式
            result = {
                "columns": correlation_matrix.columns.tolist(),  # X/Y 轴的列名
                "values": correlation_matrix.values.tolist(),  # 相关性矩阵的值
            }

            return JsonResponse({"correlation_matrix": result})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@method_decorator(csrf_exempt, name="dispatch")
class DimensionalReductionView(APIView):
    def post(self, request):
        try:
            # Parsing the request body
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            method = body.get("method", "pca").lower()
            n_components = body.get("n_components", 2)
            new_dataset_name = body.get("new_dataset_name", "Reduced Dataset")

            # Ensure dataset_id exists
            if not dataset_id:
                return JsonResponse({"error": "Missing dataset_id."}, status=400)

            try:
                dataset = Dataset.objects.get(id=int(dataset_id))
            except (Dataset.DoesNotExist, ValueError):
                return JsonResponse({"error": f"Dataset with ID {dataset_id} not found or invalid."}, status=404)

            # Get DataFrame
            if not dataset.features or not dataset.records:
                return JsonResponse({"error": "Dataset is empty or invalid."}, status=400)

            dataset_df = pd.DataFrame(dataset.records, columns=dataset.features)

            # do dim reduction
            reduced_data = Engine.dimensional_reduction(
                dataset_df,
                method=method,
                n_components=n_components
            )

            # Generate new features and records
            reduced_features = [f"dim{i+1}" for i in range(n_components)]
            reduced_records = reduced_data.to_dict(orient="records")

            # Create a new Dataset and associate it with last_dataset
            new_dataset = Dataset.objects.create(
                name=new_dataset_name,
                features=reduced_features,
                records=reduced_records,
                last_dataset=dataset  # Linked original dataset
            )

            new_dataset.id = dataset_id + 1

            return JsonResponse({
                "message": "Dimensionality reduction successful.",
                "new_dataset_id": new_dataset.id,
                "reduced_features": reduced_features,
                "reduced_records": reduced_records
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class OversampleDataView(APIView):
    def post(self, request):
        try:
            # Parse the incoming JSON body
            body = json.loads(request.body)

            # Extract the relevant fields from the request
            dataset_id = body.get("datasetId")  # Dataset ID to locate the file in the database
            params = body.get("params", {})
            x_feature = params.get("xColumn")  # get x column from params
            y_feature = params.get("yColumn")  # get y column from params
            method = params.get("method", "smote")  # Oversample method (default: smote)
            oversample_factor = params.get("num_samples", 1)  # Oversampling factor (default: 1)

            # Ensure dataset_id is provided
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)

            # Get the dataset object
            dataset = get_object_or_404(Dataset, id=dataset_id)

            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()

            # Perform oversampling (data interpolation)
            oversampled_data = Engine.oversample_data(
                dataset_df,
                x_feature=x_feature,
                y_feature=y_feature,
                method=method,
                oversample_factor=oversample_factor
            )

            # Convert the oversampled data to a dictionary for easy JSON response
            oversampled_data_json = oversampled_data.to_dict(orient="records")

            # Return the oversampled data as a JSON response
            return JsonResponse({"oversampled_data": oversampled_data_json})

        except Exception as e:
            # If any error occurs, return an error response with the exception message
            return JsonResponse({"error": str(e)}, status=400)


class ApplyPcaView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset = body.get("dataset", [])
            n_components = body.get("n_components", 2)

            if not dataset:
                return JsonResponse({"error": "dataset empty"}, status=400)

            dataset_df = pd.DataFrame(dataset)
            transformed_df = Engine.apply_pca(dataset_df, n_components=n_components)

            return JsonResponse({
                "pca_result": transformed_df.to_dict(orient="records")
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


class SuggestFeatureDroppingView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            correlation_threshold = float(body.get("correlation_threshold", 0.95))
            variance_threshold = float(body.get("variance_threshold", 0.01))

            if not dataset_id:
                return JsonResponse({"error": "Missing dataset_id"}, status=400)

            uploaded_file = UploadedFile.objects.get(id=dataset_id)
            df = Engine.data_to_panda(uploaded_file)

            features_to_drop = Engine.suggest_feature_dropping(
                df,
                correlation_threshold=correlation_threshold,
                variance_threshold=variance_threshold
            )

            return JsonResponse({"features_to_drop": features_to_drop})

        except UploadedFile.DoesNotExist:
            return JsonResponse({"error": "Dataset not found"}, status=404)
        except ValueError as ve:
            return JsonResponse({"error": f"Invalid parameter: {str(ve)}"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


class SuggestFeatureCombiningView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            correlation_threshold = body.get("correlation_threshold", 0.9)

            if not dataset_id:
                return JsonResponse({"error": "Missing dataset_id"}, status=400)

            # get file
            try:
                data_file = UploadedFile.objects.get(id=dataset_id)
            except UploadedFile.DoesNotExist:
                return JsonResponse({"error": "Dataset not found"}, status=404)

            # read file
            dataset_df = Engine.data_to_panda(data_file)

            feature_combinations = Engine.suggest_feature_combining(
                dataset_df,
                correlation_threshold=correlation_threshold
            )

            return JsonResponse({"feature_combinations": feature_combinations})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
