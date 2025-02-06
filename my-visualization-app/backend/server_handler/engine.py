import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from scipy.interpolate import interp1d
from sklearn.linear_model import LinearRegression
from scipy.optimize import curve_fit
from imblearn.over_sampling import SMOTE
from sklearn.manifold import TSNE
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.feature_selection import VarianceThreshold
from itertools import combinations

class Engine:
    def __init__(self):
        pass

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

    def dimensional_reduction(data, method="PCA", n_components=2):
    # Do dimensional reduction
    #param data: pandas.DataFrame, input data
    #param method: str，reduction method（"PCA", "t-SNE", "LDA"）
    #param n_components: int，dimension after reduction
    #return: numpy.ndarray，data after dimensional reduction
    ##
        if isinstance(data, list):
            data = np.array(data)
        elif isinstance(data, pd.DataFrame):
            data = data.values
    
        if method == "PCA":
            reducer = PCA(n_components=n_components)
        elif method == "t-SNE":
            reducer = TSNE(n_components=n_components)
        elif method == "LDA":
            reducer = LDA(n_components=n_components)
        else:
            raise ValueError("invalid dimensional reduction")
    
        return reducer.fit_transform(data)

    def suggest_feature_dropping(dataset, correlation_threshold=0.95, variance_threshold=0.01):
    #identify features suggest to be dropped：
    #1. low variance（lower than `variance_threshold`）
    #2. high correlation（higher than `correlation_threshold`）
    
    #:param dataset: pandas.DataFrame，input dataset
    #:param correlation_threshold: float，
    #:param variance_threshold: float，
    #:return: List[str]，features to drop.
        if isinstance(dataset, list):
            dataset = pd.DataFrame(dataset)

        features_to_drop = set()

    # 1. low variance
        selector = VarianceThreshold(threshold=variance_threshold)
        selector.fit(dataset)
        low_variance_features = dataset.columns[~selector.get_support()].tolist()
        features_to_drop.update(low_variance_features)

    # 2. high correlation
        corr_matrix = dataset.corr().abs()
        upper_triangle = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))

        highly_correlated_features = [column for column in upper_triangle.columns if any(upper_triangle[column] > correlation_threshold)]
        features_to_drop.update(highly_correlated_features)

        return list(features_to_drop)

    def suggest_feature_combining(dataset, correlation_threshold=0.9):
    #suggest feature combining：
    #1. high correlation（correlation > `correlation_threshold`）
    
    #:param dataset: pandas.DataFrame，
    #:param correlation_threshold: float，
    #:return: List[dict]，features to combine
        if isinstance(dataset, list):
            dataset = pd.DataFrame(dataset)

        suggested_combinations = []

    # calculate correlation
        corr_matrix = dataset.corr()
        feature_pairs = list(combinations(dataset.columns, 2))

        for feature1, feature2 in feature_pairs:
            correlation = abs(corr_matrix.loc[feature1, feature2])
            if correlation > correlation_threshold:
                suggested_combinations.append({
                    "features": [feature1, feature2],
                })

        return suggested_combinations