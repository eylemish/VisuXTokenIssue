import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from scipy.interpolate import interp1d
from scipy.optimize import curve_fit
from imblearn.over_sampling import SMOTE

class engine:
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