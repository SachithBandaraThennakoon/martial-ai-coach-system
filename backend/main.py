import time
import json
import os

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from models.pose import PoseFrame
from features.front_kick_features import extract_front_kick_features
from rules.front_kick_rules import evaluate_step
from engine.state_machine import FrontKickStateMachine
from safety.safety_checks import safety_override

from agents.orchestrator import AgentOrchestrator
from knowledge_loader import load_technique
from ai.voice import generate_voice


# --------------------------------------------------
# App Setup
# --------------------------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static voice file
os.makedirs("static", exist_ok=True)

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)

# --------------------------------------------------
# Core System
# --------------------------------------------------

state_machine = FrontKickStateMachine()
orchestrator = AgentOrchestrator()

MIN_FEEDBACK_INTERVAL = 4.0  # seconds
last_feedback_time = 0
last_sent_feedback = None


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
# WebSocket
# --------------------------------------------------

@app.websocket("/ws/pose")
async def pose_ws(ws: WebSocket):
    await ws.accept()

    global last_feedback_time, last_sent_feedback

    print("WebSocket connected")

    try:
        while True:
            data = await ws.receive_json()

            pose = PoseFrame(**data)

            # --------------------------------------------------
            # Basic pose validation
            # --------------------------------------------------

            if len(pose.landmarks) < 10:
                await ws.send_json({
                    "feedback": "Hold position regain camera view"
                })
                continue

            # --------------------------------------------------
            # Feature Extraction
            # --------------------------------------------------

            features = extract_front_kick_features(pose)

            # --------------------------------------------------
            # Safety Check
            # --------------------------------------------------

            safety = safety_override(
                state_machine.current_step,
                features
            )

            if safety["override"]:
                await ws.send_json({
                    "feedback": safety["message"]
                })
                continue

            # --------------------------------------------------
            # Rule Evaluation
            # --------------------------------------------------

            rule_result = evaluate_step(
                state_machine.current_step,
                features
            )

            features["rule"] = rule_result
            state_machine.update(features)

            # --------------------------------------------------
            # Agent Processing
            # --------------------------------------------------

            agent_output = await orchestrator.process(
                features,
                rule_result
            )

            # --------------------------------------------------
            # Build Response
            # --------------------------------------------------

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

            # Attach progress data
            payload["progress"] = agent_output.get("progress")
            payload["analysis"] = agent_output.get("analysis")
            payload["fatigue"] = agent_output.get("fatigue")
            payload["difficulty"] = agent_output.get("difficulty")

            # --------------------------------------------------
            # Send Safely
            # --------------------------------------------------

            try:
                await ws.send_json(payload)
            except:
                print("Client disconnected during send.")
                break

    except Exception as e:
        print("WebSocket error:", e)

    finally:
        print("WebSocket closed safely.")
