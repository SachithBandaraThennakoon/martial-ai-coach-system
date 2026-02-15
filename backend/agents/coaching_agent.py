import asyncio
from concurrent.futures import ThreadPoolExecutor
from openai import OpenAI

import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

executor = ThreadPoolExecutor(max_workers=2)


class CoachingAgent:

    async def generate_feedback(
        self,
        decision,
        analysis,
        session_memory
    ):

        if decision == "silent":
            return None

        if decision == "safety_priority":
            return "Stabilize and control movement"

        violation = session_memory.persistent_violation()

        if not violation:
            return None

        loop = asyncio.get_event_loop()

        def blocking_call():
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Strict martial arts coach"},
                    {"role": "user", "content": f"You are a calm, disciplined martial arts master.Speak short. Speak grounded. Speak authoritative. Short coaching cue for {violation}. Max 6 words."}
                ]
            )
            return response.choices[0].message.content

        return await loop.run_in_executor(
            executor,
            blocking_call
        )
