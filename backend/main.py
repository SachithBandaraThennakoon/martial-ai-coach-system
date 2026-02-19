import time
import json
import os

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from models.pose import PoseFrame
from safety.safety_checks import safety_override
from agents.orchestrator import AgentOrchestrator
from knowledge_loader import load_technique
from ai.voice import generate_voice
from techniques.registry import TECHNIQUE_REGISTRY


# --------------------------------------------------
# App Setup
# --------------------------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static folder exists
os.makedirs("static", exist_ok=True)

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)

# --------------------------------------------------
# Core System
# --------------------------------------------------

orchestrator = AgentOrchestrator()

MIN_FEEDBACK_INTERVAL = 4.0  # seconds


# --------------------------------------------------
# REST Endpoints
# --------------------------------------------------

@app.get("/technique/{tech_id}")
def get_technique(tech_id: str):
    return load_technique(tech_id)


@app.get("/domains")
def get_domains():
    path = os.path.join("knowledge", "domains.json")
    with open(path, "r") as f:
        return json.load(f)


# --------------------------------------------------
# WebSocket Endpoint
# --------------------------------------------------

@app.websocket("/ws/pose")
async def pose_ws(ws: WebSocket):
    await ws.accept()

    print("WebSocket connected")

    # Per-connection state
    last_feedback_time = 0
    last_sent_feedback = None
    technique_instance = None
    current_tech_id = None

    try:
        while True:
            data = await ws.receive_json()

            tech_id = data.get("technique_id")

            if not tech_id:
                await ws.send_json({
                    "feedback": "No technique selected"
                })
                continue

            if tech_id not in TECHNIQUE_REGISTRY:
                await ws.send_json({
                    "feedback": "Unknown technique"
                })
                continue

            # ------------------------------------------
            # Load technique engine dynamically
            # ------------------------------------------

            if technique_instance is None or current_tech_id != tech_id:
                technique_instance = TECHNIQUE_REGISTRY[tech_id]()
                current_tech_id = tech_id
                print(f"Loaded technique: {tech_id}")

            # ------------------------------------------
            # Pose Parsing
            # ------------------------------------------

            pose = PoseFrame(**data)

            if len(pose.landmarks) < 10:
                await ws.send_json({
                    "feedback": "Hold position regain camera view"
                })
                continue

            # ------------------------------------------
            # Feature Extraction
            # ------------------------------------------

            features = technique_instance.extract_features(pose)

            # ------------------------------------------
            # Safety Check
            # ------------------------------------------

            safety = safety_override(
                technique_instance.state_machine.current_step,
                features
            )

            if safety["override"]:
                await ws.send_json({
                    "feedback": safety["message"]
                })
                continue

            # ------------------------------------------
            # Rule Evaluation
            # ------------------------------------------

            rule_result = technique_instance.evaluate_rules(features)

            features["rule"] = rule_result

            technique_instance.update_state(features)

            # ------------------------------------------
            # Agent Processing
            # ------------------------------------------

            agent_output = await orchestrator.process(
                features,
                rule_result
            )

            # ------------------------------------------
            # Build Response
            # ------------------------------------------

            now = time.time()
            payload = {}

            new_feedback = agent_output.get("feedback")

            if (
                new_feedback
                and now - last_feedback_time > MIN_FEEDBACK_INTERVAL
                and new_feedback != last_sent_feedback
            ):
                payload["feedback"] = new_feedback

                # Generate calm warrior voice
                audio_path = generate_voice(new_feedback)
                payload["audio"] = audio_path

                last_feedback_time = now
                last_sent_feedback = new_feedback

            # Attach additional agent data
            payload["progress"] = agent_output.get("progress")
            payload["analysis"] = agent_output.get("analysis")
            payload["fatigue"] = agent_output.get("fatigue")
            payload["difficulty"] = agent_output.get("difficulty")
            payload["plan"] = agent_output.get("plan")

            # ------------------------------------------
            # Safe Send
            # ------------------------------------------

            try:
                await ws.send_json(payload)
            except:
                print("Client disconnected during send.")
                break

    except Exception as e:
        print("WebSocket error:", e)

    finally:
        print("WebSocket closed safely.")
