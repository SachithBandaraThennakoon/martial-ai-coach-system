STEPS = [
    "STANCE",
    "CHAMBER",
    "EXTENSION",
    "RECOIL",
    "RECOVERY",
]

class FrontKickStateMachine:
    def __init__(self):
        self.current_step = "STANCE"

    def update(self, features):
        step_idx = STEPS.index(self.current_step)
        rule = features["rule"]

        if rule["passed"]:
            if step_idx < len(STEPS) - 1:
                self.current_step = STEPS[step_idx + 1]

        return self.current_step
