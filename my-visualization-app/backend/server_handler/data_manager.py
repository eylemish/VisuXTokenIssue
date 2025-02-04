class DataManager(object):
    def __init__(self):
        self.data_storage = {}

    def store_data(self, file_name, data_frame):
        self.data_storage[file_name] = data_frame

    def get_data(self, file_name):
        return self.data_storage.get(file_name, None)