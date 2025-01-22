from sklearn.decomposition import PCA
import pandas as pd

class Engine:
    def process_data(self, data):

        df = pd.DataFrame(data)
        pca = PCA(n_components=2)
        reduced_data = pca.fit_transform(df)
        return reduced_data.tolist()
