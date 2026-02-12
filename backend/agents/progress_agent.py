class ProgressAgent:
    def update(self, session_state, analysis):
        session_state["total_reps"] += 1

        session_state["average_score"] = (
            session_state.get("average_score", 0) +
            analysis["quality_score"]
        ) / 2

        return session_state
