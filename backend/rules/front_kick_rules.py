FRONT_KICK_RULES = {
    "STANCE": {
        "knee_angle": (150, 180),
        "balance_min": 0.6,
    },
    "CHAMBER": {
        "knee_angle": (70, 100),
        "balance_min": 0.65,
    },
    "EXTENSION": {
        "knee_angle": (150, 180),
        "balance_min": 0.6,
    },
    "RECOIL": {
        "knee_angle": (70, 100),
        "balance_min": 0.6,
    },
    "RECOVERY": {
        "knee_angle": (150, 180),
        "balance_min": 0.6,
    },
}


def evaluate_step(step, features):
    rule = FRONT_KICK_RULES[step]
    violations = []

    if not rule["knee_angle"][0] <= features["knee_angle"] <= rule["knee_angle"][1]:
        violations.append("knee_angle")

    if features["balance"] < rule["balance_min"]:
        violations.append("balance")

    return {
        "passed": len(violations) == 0,
        "violations": violations,
    }

