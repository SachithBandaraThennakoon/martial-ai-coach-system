import time

class SessionMemory:
    def __init__(self):
        self.error_counts = {}
        self.rep_count = 0
        self.last_scores = []
        self.last_positive_time = 0

    def update(self, analysis):

        now = time.time()

        for violation in analysis["violations"]:
            self.error_counts[violation] = \
                self.error_counts.get(violation, 0) + 1


        # Remove resolved violations
        active = set(analysis["violations"])
        self.error_counts = {
            k: v for k, v in self.error_counts.items()
            if k in active
        }

        self.last_scores.append(analysis["quality_score"])
        if len(self.last_scores) > 5:
            self.last_scores.pop(0)

    def persistent_violation(self, threshold=1.5):
        now = time.time()
        for v, start_time in self.error_counts.items():
            if now - start_time > threshold:
                return v
        return None

    def increment_rep(self):
        self.rep_count += 1
        
    def violation_count(self, violation):
        return list(self.error_counts.keys()).count(violation)

        
