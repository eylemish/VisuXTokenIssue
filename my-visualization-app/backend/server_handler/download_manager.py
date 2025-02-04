class DownloadManager(object):

    def __init__(self, data_frame):
        self.data_frame = data_frame
    
    def download(self, file_format = 'csv'):
        if file_format == 'csv':
            self.data_frame.to_csv('output.csv', index = False)
        elif file_format == 'xlsx':
            self.data_frame.to_excel('output.xlsx', index = False)
        else:
            raise ValueError("Invalid File Format")