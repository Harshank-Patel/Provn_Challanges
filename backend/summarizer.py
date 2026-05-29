from openai import OpenAI
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def summarize(
    question: str,
    results: list
):

    if not results:
        return "No results found."

    prompt = f"""
You are a financial analyst.

User Question:
{question}

Results:
{json.dumps(results[:10], indent=2)}

Write a concise executive summary.

Include:
- key findings
- largest result
- notable insights

Keep it under 150 words.
"""

    response = client.responses.create(
        model="gpt-5",
        input=prompt
    )

    return response.output_text