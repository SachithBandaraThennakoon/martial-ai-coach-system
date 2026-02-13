class FatigueAgent:

    def detect(self, session_memory):

        scores = session_memory.last_scores

        if len(scores) < 5:
            return {
                "fatigued": False,
                "trend": 0
            }

        # Simple trend detection
        trend = scores[-1] - scores[0]

        if trend < -15:
            return {
                "fatigued": True,
                "trend": trend
            }

        return {
            "fatigued": False,
            "trend": trend
        }
