import sqlite3
import pandas as pd

class DatabaseManager(object):
    def __init__(self, db_path):
        self.db_path = db_path

    
    # Save Dataframe to SQLite.
    def save_to_database(self, data_frame, table_name):
        conn = sqlite3.connect(self.db_path)
        data_frame.to_sql(table_name, conn, if_exists ='replace', index=False)
        conn.close()

    # Load Dataframe from SQLite.
    def load_from_database(self, table_name):
        conn = sqlite3.connect(self.db_path)
        df = pd.read_sql('SELECT * FROM {}'.format(table_name), conn)
        conn.close()
        return df