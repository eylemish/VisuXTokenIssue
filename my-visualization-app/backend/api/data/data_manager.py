import pandas as pd

class DataManager:
    def load_data(self, file_path):
        return pd.read_csv(file_path)

    def save_data(self, data, file_path):
        pd.DataFrame(data).to_csv(file_path, index=False)
