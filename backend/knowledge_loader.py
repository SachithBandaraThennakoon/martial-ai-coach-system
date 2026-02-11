import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_technique(tech_id):
    path = os.path.join(BASE_DIR, "techniques", f"{tech_id}.json")

    if not os.path.exists(path):
        raise FileNotFoundError(f"Technique file not found: {path}")

    with open(path, "r") as f:
        return json.load(f)
