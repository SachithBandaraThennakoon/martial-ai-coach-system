import math
from models.pose import PoseFrame

def angle(a, b, c):
    """Angle at point b (in degrees)"""
    ba = (a.x - b.x, a.y - b.y)
    bc = (c.x - b.x, c.y - b.y)

    dot = ba[0]*bc[0] + ba[1]*bc[1]
    mag = math.sqrt(ba[0]**2 + ba[1]**2) * math.sqrt(bc[0]**2 + bc[1]**2)

    if mag == 0:
        return 0

    return math.degrees(math.acos(dot / mag))

def extract_front_kick_features(pose: PoseFrame):
    # Right leg example
    hip = pose.landmarks[24]
    knee = pose.landmarks[26]
    ankle = pose.landmarks[28]

    knee_angle = angle(hip, knee, ankle)

    balance_offset = abs(
        pose.landmarks[23].x - pose.landmarks[24].x
    )

    return {
        "knee_angle": knee_angle,
        "balance": 1 - balance_offset
    }
