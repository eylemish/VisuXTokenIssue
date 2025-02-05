from data_loader import DataLoader
from download_manager import DownloadManager
from .engine import Engine
from log_manager import LogManager
from data_manager import DataManager
from database_manager import DatabaseManager
import pandas as pd

class ServerHandler(object):
    def __init__(self, file_path, db_path):
        self.data_loader = DataLoader(file_path)
        self.download_manager = None
        self.engine = None
        self.log_manager = LogManager()
        self.data_manager = DataManager()
        self.database_manager = DatabaseManager(db_path)

    # Load and process data.
    def load_and_process_data(self):
        try:
            df = self.data_loader.load_data()
            self.log_manager.log_info("Load Success")
            file_name = self.data_loader.file_path.split('/')[-1]
            self.data_manager.store_data(file_name, df)

            self.engine = Engine(df)
            reduced_data = self.engine.apply_pca()

            self.database_manager.save_to_database(pd.DataFrame(reduced_data), 'reduced_data')
            self.log_manager.log_info("Process and Load Success")

            self.download_manager = DownloadManager(df)

        except Exception as e:
            self.log_manager.log_error("Error: {}".format(e))
            raise

    # Provide download function.
    def download_data(self, file_format='csv'):
        if self.download_manager:
            self.download_manager.download(file_format)
            self.log_manager.log_info("Data is exported in {} format".format(file_format))
        else:
            self.log_manager.log_error("No data can be exported.")
            raise ValueError("Data aren't processed and can't be exported.")
