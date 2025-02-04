import pandas as pd 

class DataLoader(object):
    def __init__(self, file_path):
        self.file_path = file_path

    # Accept CSV and XLSX format file and return the dataframe.
    # Else an error will be returned.
    def load_data(self):
        if self.file_path.endswith('.csv'):
            return pd.read_csv(self.file_path)
        elif self.file_path.endswith('.xlsx'):
            return pd.read_excel(self.file_path)
        else:
            return ValueError("Invaild File Type.")