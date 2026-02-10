# Priority order: safety > balance > technique
VIOLATION_PRIORITY = {
    "balance": 1,
    "knee_angle": 2,
}

SEVERITY_MAP = {
    "balance": "high",
    "knee_angle": "medium",
}


def select_feedback(violations):
    """
    Input: list of rule violations
    Output: focused feedback context
    """

    if not violations:
        return {
            "focus": None,
            "severity": None,
        }

    # sort by priority
    sorted_violations = sorted(
        violations,
        key=lambda v: VIOLATION_PRIORITY.get(v, 99)
    )

    focus = sorted_violations[0]

    return {
        "focus": focus,
        "severity": SEVERITY_MAP.get(focus, "low"),
    }
