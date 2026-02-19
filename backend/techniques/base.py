class BaseTechnique:
    def __init__(self):
        self.state_machine = None

    def extract_features(self, pose):
        raise NotImplementedError

    def evaluate_rules(self, features):
        raise NotImplementedError

    def update_state(self, features):
        raise NotImplementedError
