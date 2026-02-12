class SafetyAgent:
    def evaluate(self, features):
        warnings = []

        if features.get("knee_angle", 180) < 40:
            warnings.append("knee_overflexed")

        if features.get("balance", 1) < 0.4:
            warnings.append("loss_of_balance")

        return {
            "safe": len(warnings) == 0,
            "warnings": warnings
        }
