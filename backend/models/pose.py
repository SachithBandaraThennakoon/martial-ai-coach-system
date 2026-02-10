from pydantic import BaseModel
from typing import List

class Landmark(BaseModel):
    x: float
    y: float
    z: float | None = None

class PoseFrame(BaseModel):
    landmarks: List[Landmark]
