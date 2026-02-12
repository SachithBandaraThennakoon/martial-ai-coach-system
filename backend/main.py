import time
from fastapi import FastAPI, WebSocket
from models.pose import PoseFrame
from features.front_kick_features import extract_front_kick_features
from rules.front_kick_rules import evaluate_step
from engine.state_machine import FrontKickStateMachine
from feedback.feedback_engine import select_feedback
from safety.safety_checks import safety_override
from ai.coach import generate_coaching_feedback
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

state_machine = FrontKickStateMachine()

MIN_FEEDBACK_INTERVAL = 2.0
last_feedback_time = 0
last_sent_feedback = None

 

from agents.orchestrator import AgentOrchestrator

orchestrator = AgentOrchestrator()


from knowledge_loader import load_technique

@app.get("/technique/{tech_id}")
def get_technique(tech_id: str):
    return load_technique(tech_id)

import json
import os

@app.get("/domains")
def get_domains():
    path = os.path.join("knowledge", "domains.json")
    with open(path, "r") as f:
        return json.load(f)



@app.websocket("/ws/pose")
async def pose_ws(ws: WebSocket):
    await ws.accept()

    global last_feedback_time, last_sent_feedback

    try:
        while True:
            data = await ws.receive_json()

            pose = PoseFrame(**data)

            if len(pose.landmarks) < 10:
                await ws.send_json({
                    "feedback": "Hold position regain camera view"
                })
                continue

            features = extract_front_kick_features(pose)

            safety = safety_override(
                state_machine.current_step,
                features
            )

            if safety["override"]:
                await ws.send_json({
                    "feedback": safety["message"]
                })
                continue

            rule_result = evaluate_step(
                state_machine.current_step,
                features
            )

            features["rule"] = rule_result
            state_machine.update(features)
            
            agent_output = await orchestrator.process(
                features,
                rule_result
            )


            now = time.time()
            payload = {}

            new_feedback = agent_output.get("feedback")

            if (
                new_feedback
                and now - last_feedback_time > MIN_FEEDBACK_INTERVAL
                and new_feedback != last_sent_feedback
            ):
                payload["feedback"] = new_feedback
                last_feedback_time = now
                last_sent_feedback = new_feedback

            payload["progress"] = agent_output.get("progress")

            try:
                await ws.send_json(payload)
            except:
                print("Client disconnected during send.")
                break

    except Exception as e:
        print("WebSocket error:", e)

    finally:
        print("WebSocket closed safely.")
