import logging

class LogManager(object):
    
    def __init__(self):
        logging.basicConfig(filename='server.log', level=logging.INFO)

    
    def log_info(self, message):
        logging.info(message)

    
    def log_error(self, message):
        logging.error(message)