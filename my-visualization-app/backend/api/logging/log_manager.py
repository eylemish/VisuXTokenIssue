import logging

class LogManager:
    def __init__(self):
        self.logger = logging.getLogger("system_logs")

    def log_action(self, action, user):
        self.logger.info(f"Action: {action}, User: {user}")
