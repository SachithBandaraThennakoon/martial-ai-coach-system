class DebateAgent:

    def deliberate(self, movement, safety):

        if not safety["safe"]:
            return "safety_priority"

        if movement["violations"]:
            return "technical_correction"

        return "encourage"
