def safety_override(step, features):
    # Knee hyperextension protection
    if step == "EXTENSION" and features["knee_angle"] > 175:
        return {
            "override": True,
            "message": "Ease extension maintain control"
        }

    # Balance collapse
    if features["balance"] < 0.4:
        return {
            "override": True,
            "message": "Reset stance regain balance"
        }

    return {"override": False}
