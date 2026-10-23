import os
import time

from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-2.5-flash"

FALLBACK_ANSWER = (
    "I don't have enough information in the knowledge base to answer that."
)


def generate_answer(question: str, context: str) -> str:
    prompt = f"""
Answer the user's question using ONLY the provided knowledge base context.

If the context does not contain enough information, say:
"I don't have enough information in the knowledge base to answer that."

Knowledge base context:
{context}

User question:
{question}
"""

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
            )

            return response.text or FALLBACK_ANSWER

        except Exception as error:
            print(
                f"LLM request failed "
                f"(attempt {attempt + 1}/3): {error}"
            )

            if attempt < 2:
                time.sleep(2)

    return FALLBACK_ANSWER