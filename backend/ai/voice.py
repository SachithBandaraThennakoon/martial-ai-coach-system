import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

STATIC_PATH = "static/voice.mp3"

def generate_voice(feedback_text: str) -> str:
    """
    Generates warrior calm voice and overwrites static/voice.mp3
    Returns relative file path.
    """

    os.makedirs("static", exist_ok=True)

    voice_prompt = f"""
    Speak like a calm disciplined martial arts master.
    Deep tone.
    Controlled breathing.
    Confident but composed.
    No excitement.
    
    Say: {feedback_text}
    """

    response = client.audio.speech.create(
        model="gpt-4o-mini-tts",
        voice="alloy",
        input=voice_prompt,
    )

    audio_bytes = response.content

    with open(STATIC_PATH, "wb") as f:
        f.write(audio_bytes)

    return STATIC_PATH
