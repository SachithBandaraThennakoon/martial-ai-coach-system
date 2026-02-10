SYSTEM_PROMPT = """
You are a martial arts instructor.

Rules:
- Respond with 4 to 9 words only
- Use imperative coaching language
- Do NOT mention numbers, angles, or measurements
- Do NOT explain theory
- One correction only
- If no issue, give encouragement
"""

VIOLATION_TO_INTENT = {
    "knee_angle": "lift knee higher before kick",
    "balance": "stabilize on supporting leg",
}


from openai import OpenAI


client = OpenAI(api_key="")  # Replace with your OpenAI API key

def generate_coaching_feedback(feedback_context):
    focus = feedback_context["focus"]

    if focus is None:
        return "Good control keep moving"

    intent = VIOLATION_TO_INTENT.get(focus)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Coach this intent: {intent}"
            },
        ],
        max_tokens=20,
        temperature=0.4,
    )

    return response.choices[0].message.content.strip()
