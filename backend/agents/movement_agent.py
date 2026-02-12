class MovementAnalysisAgent:

    def analyze(self, features, rule_result):

        violations = rule_result.get("violations", [])

        analysis = {
            "step": rule_result.get("step"),
            "violations": violations,
            "quality_score": self._calculate_quality(features),
        }

        return analysis

    def _calculate_quality(self, features):
        score = 100

        balance = features.get("balance", 1)
        velocity = features.get("velocity", 1)

        if balance < 0.6:
            score -= 20

        if velocity < 0.8:
            score -= 10

        return max(score, 0)
