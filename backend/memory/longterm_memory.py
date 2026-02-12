class LongTermMemory:
    def __init__(self):
        self.user_profile = {
            "total_reps": 0,
            "average_score": 0,
            "weak_points": {}
        }

    def update_profile(self, analysis):
        self.user_profile["total_reps"] += 1

        score = analysis["quality_score"]

        current_avg = self.user_profile["average_score"]

        self.user_profile["average_score"] = (
            (current_avg + score) / 2
        )

        for violation in analysis["violations"]:
            self.user_profile["weak_points"][violation] = \
                self.user_profile["weak_points"].get(
                    violation, 0
                ) + 1
