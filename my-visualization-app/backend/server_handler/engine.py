import pandas as pd
import numpy as np
import os
from sklearn.decomposition import PCA
from scipy.interpolate import interp1d
from sklearn.linear_model import LinearRegression
from scipy.optimize import curve_fit
from imblearn.over_sampling import SMOTE
from sklearn.manifold import TSNE
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.feature_selection import VarianceThreshold
from scipy.interpolate import interp1d, UnivariateSpline
from itertools import combinations
from backend.api.models import UploadedFile
import umap.umap_ as umap

class Engine:
    def __init__(self):
        pass

    @staticmethod
    def data_to_panda(dataset_id: int) -> pd.DataFrame:
        """
        根据 dataset_id 获取数据并转换为 Pandas DataFrame
        """
        try:
            dataset = UploadedFile.objects.get(id=dataset_id)
            file_path = dataset.file_path.path

            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")

            if dataset.file_type == "csv":
                return pd.read_csv(file_path)
            elif dataset.file_type == "xlsx":
                return pd.read_excel(file_path, engine="openpyxl")
            else:
                raise ValueError(f"Unsupported file type: {dataset.file_type}")

        except UploadedFile.DoesNotExist:
            raise ValueError(f"Dataset with ID {dataset_id} not found.")
        except Exception as e:
            raise ValueError(f"Error loading dataset: {e}")

    @staticmethod
    def apply_pca(data: pd.DataFrame, n_components: int = 2) -> pd.DataFrame:
        """
        执行 PCA 降维
        """
        try:
            pca = PCA(n_components=n_components)
            transformed_data = pca.fit_transform(data)
            columns = [f'PC{i + 1}' for i in range(n_components)]
            return pd.DataFrame(transformed_data, columns=columns)
            AuditLog.objects.create(
                tool_type="PCA",
                timestamp=now(),
                params="{'n_components': 2}",  # 这里可以存 JSON 或字符串
                is_reverted=False )
        except Exception as e:
            raise ValueError(f"Error in PCA processing: {e}")

    @staticmethod
    def apply_tsne(data: pd.DataFrame, n_components: int = 2) -> pd.DataFrame:
        """
        执行 t-SNE 降维
        """
        try:
            tsne = TSNE(n_components=n_components)
            transformed_data = tsne.fit_transform(data)
            columns = [f'TSNE{i + 1}' for i in range(n_components)]
            return pd.DataFrame(transformed_data, columns=columns)
        except Exception as e:
            raise ValueError(f"Error in t-SNE processing: {e}")

    @staticmethod
    def apply_umap(data: pd.DataFrame, n_components: int = 2) -> pd.DataFrame:
        """
        执行 UMAP 降维
        """
        try:
            reducer = umap.UMAP(n_components=n_components)
            transformed_data = reducer.fit_transform(data)
            columns = [f'UMAP{i + 1}' for i in range(n_components)]
            return pd.DataFrame(transformed_data, columns=columns)
        except Exception as e:
            raise ValueError(f"Error in UMAP processing: {e}")

    @staticmethod
    def dimensional_reduction(data: pd.DataFrame, method: str, n_components: int = 2) -> pd.DataFrame:
        """
        根据指定方法执行降维
        """
        if not isinstance(data, pd.DataFrame):
            raise ValueError("Input data must be a pandas DataFrame.")

        # 选择数值型数据
        numeric_data = data.select_dtypes(include=['number'])
        if numeric_data.empty:
            raise ValueError("Dataset does not contain numeric data suitable for dimensionality reduction.")

        # 执行降维
        if method == "pca":
            return Engine.apply_pca(numeric_data, n_components)
        elif method == "tsne":
            return Engine.apply_tsne(numeric_data, n_components)
        elif method == "umap":
            return Engine.apply_umap(numeric_data, n_components)
        else:
            raise ValueError(f"Unsupported dimensionality reduction method: {method}")
    """
    # Do interpolate with given data, given kind of interpolation, the number of generated data and the given range.
    # The default generated kind is linear.
    # The default number of generated data is 100.
    # User is allowed to set the range of the interpolation(extrapolation).
    # If the user doesn't set the range, the default value will be the maximum and minimum in x.
    def interpolate(self, x: np.ndarray, y: np.ndarray, kind: str = 'linear', num_points: int = 100, min_value = None, max_value = None) -> pd.DataFrame:
        try:
            interpolator = interp1d(x, y, kind=kind, ill_value = "extrapolate")
            if min_value is None:
                min_value = np.min(x)
            if max_value is None:
                max_value = np.max(x)
            x_new = np.linspace(min_value, max_value, num_points)
            y_new = interpolator(x_new)
            return pd.DataFrame({'x': x_new, 'y': y_new})
        except Exception as e:
            raise ValueError(f"Error in interpolation: {e}")
    """

    def interpolate(self, dataset: pd.DataFrame, x_feature: str, y_feature: str, kind: str = 'linear', num_points: int = 100, min_value=None, max_value=None, degree: int = 3) -> pd.DataFrame:
        """
        Perform interpolation (or extrapolation) on a given dataset.

        :param dataset: pandas.DataFrame, the input dataset
        :param x_feature: str, the column name for the independent variable (x-axis)
        :param y_feature: str, the column name for the dependent variable (y-axis)
        :param kind: str, type of interpolation ("linear", "polynomial", "spline")
        :param num_points: int, number of generated data points (default: 100)
        :param min_value: float, minimum x value for interpolation (default: min(dataset[x_feature]))
        :param max_value: float, maximum x value for interpolation (default: max(dataset[x_feature]))
        :param degree: int, degree of the polynomial (only used for "polynomial" and "spline")
        :return: pandas.DataFrame containing interpolated 'x' and 'y' values
        """

        try:
            # Ensure that x_feature and y_feature exist in the DataFrame
            if x_feature not in dataset.columns or y_feature not in dataset.columns:
                raise ValueError(f"Columns '{x_feature}' and/or '{y_feature}' not found in dataset")

            # Extract x and y data
            x = dataset[x_feature].values
            y = dataset[y_feature].values

            # Use min and max values from the dataset if not provided
            if min_value is None:
                min_value = np.min(x)
            if max_value is None:
                max_value = np.max(x)

            # Generate new x values for interpolation
            x_new = np.linspace(min_value, max_value, num_points)

            # Linear interpolation
            if kind == "linear":
                interpolator = interp1d(x, y, kind="linear", fill_value="extrapolate")
                y_new = interpolator(x_new)

            # Polynomial interpolation
            elif kind == "polynomial":
                poly_coeffs = np.polyfit(x, y, degree)
                poly_func = np.poly1d(poly_coeffs)
                y_new = poly_func(x_new)

            # Spline interpolation
            elif kind == "spline":
                spline = UnivariateSpline(x, y, k=min(degree, len(x) - 1), s=0)
                y_new = spline(x_new)

            # Exponential interpolation
            elif kind == "exponential":
                # Ensure all y values are positive (required for log transformation)
                if np.any(y <= 0):
                    raise ValueError("Exponential interpolation requires all y values to be positive.")

                # Fit a linear model to log(y)
                log_y = np.log(y)
                coeffs = np.polyfit(x, log_y, 1)
                exp_func = lambda x_val: np.exp(coeffs[1]) * np.exp(coeffs[0] * x_val)
                y_new = exp_func(x_new)

            else:
                raise ValueError("Unsupported interpolation method. Choose from 'linear', 'polynomial', or 'spline'.")

            # Return the interpolated DataFrame
            return pd.DataFrame({'x': x_new, 'y': y_new})

        except Exception as e:
            raise ValueError(f"Error in interpolation: {e}")

    def extrapolate(data: pd.DataFrame, x_feature: str, y_feature: str, target_x: list, method="linear", degree=2) -> pd.DataFrame:
        """
        Perform extrapolation using different methods.

        :param data: pandas.DataFrame, input data with features
        :param x_feature: str, name of the column used as x values
        :param y_feature: str, name of the column used as y values
        :param target_x: list, target x values for extrapolation
        :param method: str, extrapolation method ("linear", "polynomial", "exponential", "spline")
        :param degree: int, degree of polynomial fit (default: 2)
        :return: pandas.DataFrame, extrapolated data with columns ['x', 'y']
        """
    
        if not isinstance(data, pd.DataFrame):
            raise TypeError("Input data must be a pandas DataFrame")
        if x_feature not in data.columns or y_feature not in data.columns:
            raise ValueError(f"DataFrame must contain columns '{x_feature}' and '{y_feature}'")

        X = data[x_feature].values.reshape(-1, 1)  # Extract x values
        y = data[y_feature].values  # Extract y values
        target_x = np.array(target_x)  # Convert to numpy array

        if method == "linear":
            model = LinearRegression()
            model.fit(X, y)
            y_pred = model.predict(target_x.reshape(-1, 1))

        elif method == "polynomial":
            coeffs = np.polyfit(X.flatten(), y, degree)
            poly_func = np.poly1d(coeffs)
            y_pred = poly_func(target_x)

        elif method == "exponential":
            # Use log transformation for exponential regression
            if np.any(y <= 0):
                raise ValueError("Exponential extrapolation requires positive y values")
            log_y = np.log(y)
            model = LinearRegression()
            model.fit(X, log_y)
            log_y_pred = model.predict(target_x.reshape(-1, 1))
            y_pred = np.exp(log_y_pred)  # Convert back to exponential form

        elif method == "spline":
            spline_func = interp1d(X.flatten(), y, kind="cubic", fill_value="extrapolate")
            y_pred = spline_func(target_x)

        else:
            raise ValueError("Unsupported extrapolation method. Choose from 'linear', 'polynomial', 'exponential', or 'spline'.")

        # Return extrapolated data as a pandas DataFrame
        return pd.DataFrame({x_feature: target_x, y_feature: y_pred})

    def fit_curve(self, dataset: pd.DataFrame, x_feature: str, y_feature: str, method: str = "linear", degree: int = 2, initial_params: list = None):
        """
        Perform curve fitting on the given dataset.

        :param dataset: pandas.DataFrame, the input dataset
        :param x_feature: str, the column name for the independent variable (x-axis)
        :param y_feature: str, the column name for the dependent variable (y-axis)
        :param method: str, the type of curve fitting ("linear", "polynomial", "exponential")
        :param degree: int, the degree of the polynomial (only used for "polynomial" method)
        :param initial_params: list, initial parameters for curve fitting (only used for "exponential" method)
        :return: tuple (params, covariance, fitted_data)
                 - params: the fitted parameters
                 - covariance: covariance of the fitted parameters (None for polynomial fitting)
                 - fitted_data: pandas.DataFrame with 'x' and 'y' values of the fitted curve
        """
        try:
            # make sure x_feature and y_feature are in DataFrame 
            if x_feature not in dataset.columns or y_feature not in dataset.columns:
                raise ValueError(f"Columns '{x_feature}' and/or '{y_feature}' not found in dataset")

            x = dataset[x_feature].values
            y = dataset[y_feature].values

            # generate x
            x_fit = np.linspace(np.min(x), np.max(x), 100)

            if method == "linear":
                def linear_func(x, a, b):
                    return a * x + b

                params, covariance = curve_fit(linear_func, x, y)
                y_fit_curve = linear_func(x_fit, *params)

            elif method == "polynomial":
                poly_coeffs = np.polyfit(x, y, degree)
                poly_func = np.poly1d(poly_coeffs)
                y_fit_curve = poly_func(x_fit)
                params, covariance = poly_coeffs, None  # no covariance for polynomial

            elif method == "exponential":
                def exp_func(x, a, b, c):
                    return a * np.exp(b * x) + c

                if initial_params is None:
                    initial_params = [1.0, 0.1, 1.0]  # default params

                params, covariance = curve_fit(exp_func, x, y, p0=initial_params)
                y_fit_curve = exp_func(x_fit, *params)

            else:
                raise ValueError("Unsupported method. Choose from 'linear', 'polynomial', or 'exponential'.")

            # create result DataFrame
            fitted_data = pd.DataFrame({"x": x_fit, "y": y_fit_curve})

            return params, covariance, fitted_data

        except Exception as e:
            raise ValueError(f"Error in curve fitting: {e}")
    """
    # Oversample the data in SMOTE.
    def oversample(self, x: np.ndarray, y:np.ndarray):
        try:
            smote = SMOTE(random_state = None)
            x_resampled, y_oversampled = smote.fit_resample(x, y)
            return x_resampled, y_oversampled
        except Exception as e:
            raise ValueError(f"Error in oversampling: {e}")
    """

    def oversample_data(dataset: pd.DataFrame, x_feature: str, y_feature: str, method: str = 'linear', num_samples: int = 100, degree: int = 3) -> pd.DataFrame:
        """
        Perform oversampling by interpolating between the existing data points.

        :param dataset: pandas.DataFrame, input data containing the features to oversample
        :param x_feature: str, the column name for the independent variable (x-axis)
        :param y_feature: str, the column name for the dependent variable (y-axis)
        :param method: str, interpolation method ("linear", "spline", "polynomial")
        :param num_samples: int, the number of samples to generate between the data points
        :param degree: int, degree of the polynomial (used only for polynomial interpolation)
        :return: pandas.DataFrame, oversampled data with interpolated values for the features
        """
        try:
            # Ensure that x_feature and y_feature exist in the DataFrame
            if x_feature not in dataset.columns or y_feature not in dataset.columns:
                raise ValueError(f"Columns '{x_feature}' and/or '{y_feature}' not found in dataset")

            # Extract x and y data
            x = dataset[x_feature].values
            y = dataset[y_feature].values

            # Sort the data by x values to ensure proper interpolation
            sorted_indices = np.argsort(x)
            x_sorted = x[sorted_indices]
            y_sorted = y[sorted_indices]

            # Generate new x values for interpolation (creating `num_samples` new points between existing points)
            new_x_values = np.linspace(np.min(x_sorted), np.max(x_sorted), num_samples)

            # Linear interpolation
            if method == "linear":
                interpolator = interp1d(x_sorted, y_sorted, kind="linear", fill_value="extrapolate")
                new_y_values = interpolator(new_x_values)

            # Polynomial interpolation
            elif method == "polynomial":
                poly_coeffs = np.polyfit(x_sorted, y_sorted, degree)
                poly_func = np.poly1d(poly_coeffs)
                new_y_values = poly_func(new_x_values)

            # Spline interpolation
            elif method == "spline":
                spline = UnivariateSpline(x_sorted, y_sorted, k=degree, s=0)
                new_y_values = spline(new_x_values)

            else:
                raise ValueError("Invalid interpolation method. Choose from 'linear', 'spline', or 'polynomial'.")

            # Create a new DataFrame with the oversampled data
            oversampled_data = pd.DataFrame({x_feature: new_x_values, y_feature: new_y_values})

            return oversampled_data

        except Exception as e:
            raise ValueError(f"Error in oversampling data: {e}")

    def suggest_feature_dropping(dataset: pd.DataFrame, correlation_threshold=0.95, variance_threshold=0.01):
        """
        Identify features to be dropped based on:
        1. Low variance (below `variance_threshold`).
        2. High correlation (above `correlation_threshold`).

        :param dataset: pandas.DataFrame, input dataset
        :param correlation_threshold: float, threshold for high correlation (default: 0.95)
        :param variance_threshold: float, threshold for low variance (default: 0.01)
        :return: List[str], list of features to drop.
        """

        if not isinstance(dataset, pd.DataFrame):
            raise TypeError("Input dataset must be a pandas DataFrame")

        features_to_drop = set()

        # 1. low variance
        selector = VarianceThreshold(threshold=variance_threshold)
        selector.fit(dataset)
        low_variance_features = dataset.columns[~selector.get_support()].tolist()
        features_to_drop.update(low_variance_features)

        # 2. high correlation
        corr_matrix = dataset.corr().abs() 
        upper_triangle = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)) 

        highly_correlated_features = [
            column for column in upper_triangle.columns if any(upper_triangle[column] > correlation_threshold)
        ]
        features_to_drop.update(highly_correlated_features)

        return list(features_to_drop)
        

    def suggest_feature_combining(dataset: pd.DataFrame, correlation_threshold=0.9):
        """
        Suggest feature combinations based on high correlation (correlation > `correlation_threshold`).

        :param dataset: pandas.DataFrame, input dataset
        :param correlation_threshold: float, threshold for high correlation (default: 0.9)
        :return: List[dict], suggested feature pairs for combining.
        """
        if not isinstance(dataset, pd.DataFrame):
            raise TypeError("Input dataset must be a pandas DataFrame")

        suggested_combinations = []

        # correlation matrix
        corr_matrix = dataset.corr().abs()
    
        # all feature pairs
        feature_pairs = combinations(dataset.columns, 2)

        # chose high correlation pairs
        for feature1, feature2 in feature_pairs:
            correlation = corr_matrix.loc[feature1, feature2]
            if correlation > correlation_threshold:
                suggested_combinations.append({
                    "features": [feature1, feature2],
                    "correlation": correlation 
                })
        return suggested_combinations

    def compute_correlation(data: pd.DataFrame, feature_1: str, feature_2: str, method="pearson") -> float:
        """
        Compute the correlation between two specified features in a pandas DataFrame.

        :param data: pandas.DataFrame, the input data containing numeric features
        :param feature_1: str, the name of the first feature (column) to compare
        :param feature_2: str, the name of the second feature (column) to compare
        :param method: str, the correlation method to use ("pearson", "spearman", "kendall")
        :return: float, correlation coefficient between the two features
        """
        if not isinstance(data, pd.DataFrame):
            raise TypeError("Input data must be a pandas DataFrame")

        if feature_1 not in data.columns or feature_2 not in data.columns:
            raise ValueError(f"Features '{feature_1}' and/or '{feature_2}' not found in the dataset")

        if method == "pearson":
            correlation = data[feature_1].corr(data[feature_2], method="pearson")
        elif method == "spearman":
            correlation = data[feature_1].corr(data[feature_2], method="spearman")
        elif method == "kendall":
            correlation = data[feature_1].corr(data[feature_2], method="kendall")
        else:
            raise ValueError("Invalid correlation method. Choose from 'pearson', 'spearman', or 'kendall'.")

        return correlation
