from techniques.base import BaseTechnique
from features.front_kick_features import extract_front_kick_features
from rules.front_kick_rules import evaluate_step
from engine.state_machine import FrontKickStateMachine


class FrontKickTechnique(BaseTechnique):

    def __init__(self):
        self.state_machine = FrontKickStateMachine()

    def extract_features(self, pose):
        return extract_front_kick_features(pose)

    def evaluate_rules(self, features):
        return evaluate_step(
            self.state_machine.current_step,
            features
        )

    def update_state(self, features):
        return self.state_machine.update(features)
