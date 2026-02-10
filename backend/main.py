import time
from fastapi import FastAPI, WebSocket
from models.pose import PoseFrame
from features.front_kick_features import extract_front_kick_features
from rules.front_kick_rules import evaluate_step
from engine.state_machine import FrontKickStateMachine
from feedback.feedback_engine import select_feedback
from safety.safety_checks import safety_override
from ai.coach import generate_coaching_feedback

app = FastAPI()
state_machine = FrontKickStateMachine()

MIN_FEEDBACK_INTERVAL = 0.5
last_feedback_time = 0


@app.websocket("/ws/pose")
async def pose_ws(ws: WebSocket):
    await ws.accept()
    global last_feedback_time

    while True:
        data = await ws.receive_json()
        pose = PoseFrame(**data)

        # basic pose validity
        if len(pose.landmarks) < 10:
            await ws.send_json({
                "step": state_machine.current_step,
                "feedback": "Hold position regain camera view"
            })
            continue

        # feature extraction
        features = extract_front_kick_features(pose)

        # safety override
        safety = safety_override(state_machine.current_step, features)
        if safety["override"]:
            state_machine.current_step = "STANCE"
            await ws.send_json({
                "step": "STANCE",
                "feedback": safety["message"]
            })
            continue

        # rule evaluation
        rule_result = evaluate_step(
            state_machine.current_step,
            features
        )

        # feedback filtering
        feedback_context = select_feedback(
            rule_result["violations"]
        )

        # step update
        features["rule"] = rule_result
        step = state_machine.update(features)

        # throttling
        now = time.time()
        payload = {"step": step}

        if now - last_feedback_time > MIN_FEEDBACK_INTERVAL:
            payload["feedback"] = generate_coaching_feedback(
                feedback_context
            )
            last_feedback_time = now

        await ws.send_json(payload)
