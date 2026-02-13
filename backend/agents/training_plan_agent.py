class TrainingPlanAgent:

    def suggest(self, longterm_memory):

        avg = longterm_memory.user_profile["average_score"]

        if avg < 60:
            return "Focus on slow chamber drills"

        if avg < 80:
            return "Add controlled speed reps"

        return "Advance to combination drills"
