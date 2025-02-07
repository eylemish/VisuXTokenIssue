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
from itertools import combinations
from backend.api.models import UploadedFile

class Engine:
    def __init__(self):
        pass

    def data_to_panda(data: UploadedFile):
        file_path = data.file_path.path

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        if data.file_type == "csv":
            return pd.read_csv(file_path)
        elif data.file_type == "xlsx":
            return pd.read_excel(file_path, engine="openpyxl")
        else:
            raise ValueError(f"Unsupported file type: {data.file_type}")



    # Apply PCA with given data and number of dimensions after dimensionality reduction.
    # The default number of dimensions after dimensionality reduction is 2.
    def apply_pca(self, data: pd.DataFrame,n_components: int = 2) -> pd.DataFrame:
        try:
            pca = PCA(n_components=n_components)
            transformed_data = pca.fit_transform(data)
            columns = [f'PC{i + 1}' for i in range(n_components)]
            return pd.DataFrame(transformed_data, columns = columns)
        except Exception as e:
            raise ValueError(f"Error in PCA processing: {e}")

    def apply_tsne(self, n_components):
        tsne = TSNE(n_components=n_components)
        return tsne.fit_transform(self.data)

    def apply_umap(self, n_components):
        reducer = umap.UMAP(n_components=n_components)
        return reducer.fit_transform(self.data)

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
    def extrapolate(data, target_x, method="linear"):
    #Do extrapolation
    #param data: List[List[float]]，inputdata in format [[x1, y1], [x2, y2], ...]
    #param target_x: List[float]，target x that need extrapolation
    #param method: str，extrapolate methods ("linear", "polynomial", "spline")
    #return: List[float]，y after extrapolation
        data = np.array(data)
        X = data[:, 0].reshape(-1, 1)  #  x 
        y = data[:, 1]  #  y 

        if method == "linear":
            model = LinearRegression()
            model.fit(X, y)
            return model.predict(np.array(target_x).reshape(-1, 1)).tolist()

        elif method == "polynomial":
            degree = 2  # can adjust degree of polynom
            coeffs = np.polyfit(X.flatten(), y, degree)
            poly_func = np.poly1d(coeffs)
            return poly_func(target_x).tolist()

        elif method == "spline":
            spline_func = interp1d(X.flatten(), y, kind="cubic", fill_value="extrapolate")
            return spline_func(target_x).tolist()

        else:
            raise ValueError("Unsupported extrapolation method.")

    # Do curve fitting with given data, target function and initial parameters.
    def fit_curve(self, x: np.ndarray, y: np.ndarray, func, initial_params: list):
        try:
            params, covariance = curve_fit(func, x, y, p0 = initial_params)
            x_fit = np.linspace(np.min(x), np.max(x), 100)
            y_fit = func(x_fit, *params)
            fitted_data = pd.DataFrame({'x': x_fit, 'y': y_fit})
            return params, covariance, fitted_data
        except Exception as e:
            raise ValueError(f"Error in curve fitting: {e}")

    # Oversample the data in SMOTE.
    def oversample(self, x: np.ndarray, y:np.ndarray):
        try:
            smote = SMOTE(random_state = None)
            x_resampled, y_oversampled = smote.fit_resample(x, y)
            return x_resampled, y_oversampled
        except Exception as e:
            raise ValueError(f"Error in oversampling: {e}")

    def dimensional_reduction(data: pd.DataFrame, method="PCA", n_components=2):
        """
        Perform dimensionality reduction on a given pandas DataFrame.

        :param data: pandas.DataFrame, input data
        :param method: str, reduction method ("PCA", "t-SNE", "LDA")
        :param n_components: int, target dimension after reduction
        :return: pandas.DataFrame, transformed data
        """

        if not isinstance(data, pd.DataFrame):
            raise TypeError("Input data must be a pandas DataFrame")

        if method == "PCA":
            reducer = PCA(n_components=n_components)
        elif method == "t-SNE":
            reducer = TSNE(n_components=n_components)
        elif method == "LDA":
            reducer = LDA(n_components=n_components)
        else:
            raise ValueError("Invalid dimensional reduction method. Choose from 'PCA', 't-SNE', or 'LDA'.")

        reduced_data = reducer.fit_transform(data)

        # back to pandas DataFrame
        column_names = [f"Component_{i+1}" for i in range(n_components)]
        return pd.DataFrame(reduced_data, columns=column_names)

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