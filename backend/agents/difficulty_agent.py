class DifficultyAgent:

    def adjust(self, longterm_memory):

        avg = longterm_memory.user_profile["average_score"]

        if avg > 85:
            return "increase_difficulty"

        if avg < 60:
            return "reduce_difficulty"

        return "maintain"
