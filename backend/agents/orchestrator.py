from agents.movement_agent import MovementAnalysisAgent
from agents.safety_agent import SafetyAgent
from agents.coaching_agent import CoachingAgent
from agents.reasoning_agent import ReasoningAgent
from agents.progress_agent import ProgressAgent
from agents.difficulty_agent import DifficultyAgent
from agents.fatigue_agent import FatigueAgent
from agents.training_plan_agent import TrainingPlanAgent

from memory.session_memory import SessionMemory
from memory.longterm_memory import LongTermMemory

from ai.voice import generate_voice


class AgentOrchestrator:

    def __init__(self):
        self.movement = MovementAnalysisAgent()
        self.safety = SafetyAgent()
        self.coaching = CoachingAgent()
        self.reasoning = ReasoningAgent()
        self.progress = ProgressAgent()
        self.difficulty = DifficultyAgent()
        self.fatigue = FatigueAgent()
        self.training_plan = TrainingPlanAgent()

        self.session_memory = SessionMemory()
        self.longterm_memory = LongTermMemory()

    async def process(self, features, rule_result):

        # 1️⃣ Movement analysis
        analysis = self.movement.analyze(
            features,
            rule_result
        )

        # 2️⃣ Safety check
        safety = self.safety.evaluate(features)

        # 3️⃣ Update session memory
        self.session_memory.update(analysis)

        # 4️⃣ Fatigue detection
        fatigue = self.fatigue.detect(
            self.session_memory
        )

        # 5️⃣ Decision logic
        decision = self.reasoning.decide(
            analysis,
            safety,
            self.session_memory
        )

        # 6️⃣ Coaching feedback (async LLM safe)
        feedback = await self.coaching.generate_feedback(
            decision,
            analysis,
            self.session_memory
        )

        # 7️⃣ Rep tracking
        if rule_result.get("completed_rep"):
            self.session_memory.increment_rep()
            self.longterm_memory.update_profile(
                analysis
            )

        # 8️⃣ Difficulty adjustment
        difficulty = self.difficulty.adjust(
            self.longterm_memory
        )

        # 9️⃣ Training plan suggestion
        plan = self.training_plan.suggest(
            self.longterm_memory
        )

        audio_path = None

        if feedback:
            audio_path = generate_voice(feedback)

        

        return {
            "feedback": feedback,
            "audio": audio_path,
            "analysis": analysis,
            "safety": safety,
            "difficulty": difficulty,
            "fatigue": fatigue,
            "progress": self.longterm_memory.user_profile,
            "plan": plan
        }
