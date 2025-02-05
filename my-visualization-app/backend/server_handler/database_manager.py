import sqlite3
import pandas as pd
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

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

    def get_columns(self, table_name):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = [row[1] for row in cursor.fetchall()]
            conn.close
            return columns
        except Exception as e:
            conn.close()
            raise Exception(f"Failure: {str(e)}")

    def add_data(self, table_name, new_data):
        conn = sqlite3.connect(self.db_path)
        df = pd.read_sql(f"SELECT * FROM {table_name}", conn)
        if set(df.columns) != set(new_data.keys()):
            conn.close()
            return {"error": "The given data is invalid"}
        new_df = pd.DataFrame([new_data])
        new_df.to_sql(table_name, conn, if_exists="append", index=False)
        conn.close()
        return {"message": "The data is added"}
