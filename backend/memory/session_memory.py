import time

class SessionMemory:
    def __init__(self):
        self.recent_errors = {}
        self.rep_count = 0
        self.last_scores = []
        self.last_positive_time = 0

    def update(self, analysis):

        now = time.time()

        for violation in analysis["violations"]:
            if violation not in self.recent_errors:
                self.recent_errors[violation] = now

        # Remove resolved violations
        active = set(analysis["violations"])
        self.recent_errors = {
            k: v for k, v in self.recent_errors.items()
            if k in active
        }

        self.last_scores.append(analysis["quality_score"])
        if len(self.last_scores) > 5:
            self.last_scores.pop(0)

    def persistent_violation(self, threshold=1.5):
        now = time.time()
        for v, start_time in self.recent_errors.items():
            if now - start_time > threshold:
                return v
        return None

    def increment_rep(self):
        self.rep_count += 1
