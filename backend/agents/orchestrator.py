from agents.movement_agent import MovementAnalysisAgent
from agents.safety_agent import SafetyAgent
from agents.coaching_agent import CoachingAgent
from agents.reasoning_agent import ReasoningAgent
from agents.progress_agent import ProgressAgent
from agents.difficulty_agent import DifficultyAgent

from memory.session_memory import SessionMemory
from memory.longterm_memory import LongTermMemory


class AgentOrchestrator:

    def __init__(self):
        self.movement = MovementAnalysisAgent()
        self.safety = SafetyAgent()
        self.coaching = CoachingAgent()
        self.reasoning = ReasoningAgent()
        self.progress = ProgressAgent()
        self.difficulty = DifficultyAgent()

        self.session_memory = SessionMemory()
        self.longterm_memory = LongTermMemory()

    # IMPORTANT: async now
    async def process(self, features, rule_result):

        # -------------------------
        # Movement Analysis
        # -------------------------
        analysis = self.movement.analyze(
            features,
            rule_result
        )

        # -------------------------
        # Safety Check
        # -------------------------
        safety = self.safety.evaluate(features)

        # -------------------------
        # Update Short-Term Memory
        # -------------------------
        self.session_memory.update(analysis)

        # -------------------------
        # Reasoning Decision
        # -------------------------
        decision = self.reasoning.decide(
            analysis,
            safety,
            self.session_memory
        )

        # -------------------------
        # Coaching (Async LLM)
        # -------------------------
        feedback = await self.coaching.generate_feedback(
            decision,
            analysis,
            self.session_memory
        )

        # -------------------------
        # Rep Tracking
        # -------------------------
        if rule_result.get("completed_rep"):
            self.session_memory.increment_rep()
            self.longterm_memory.update_profile(
                analysis
            )

        # -------------------------
        # Difficulty Adjustment
        # -------------------------
        difficulty = self.difficulty.adjust(
            self.longterm_memory
        )

        return {
            "feedback": feedback,
            "analysis": analysis,
            "safety": safety,
            "difficulty": difficulty,
            "progress": self.longterm_memory.user_profile
        }
