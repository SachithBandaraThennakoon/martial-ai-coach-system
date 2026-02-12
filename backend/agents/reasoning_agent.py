class ReasoningAgent:

    def decide(self, movement, safety, session_memory):

        if not safety["safe"]:
            return "safety_priority"

        persistent = session_memory.persistent_violation()

        if persistent:
            return "technical_correction"

        # Silence when clean
        if not movement["violations"]:
            return "silent"

        return "wait"
