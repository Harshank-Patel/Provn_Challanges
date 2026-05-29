import json
import os

from openai import OpenAI
from backend.metadata import get_metadata
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

ALLOWED_GROUPS = {
    "agency",
    "vendor",
    "category",
    "month"
}


def translate(question: str):

    metadata = get_metadata()

    agencies = "\n".join(
        metadata["agencies"]
    )

    categories = "\n".join(
        metadata["categories"]
    )

    prompt = f"""
You translate natural language questions into QuerySpec JSON.

VALID AGENCIES:

{agencies}

VALID CATEGORIES:

{categories}

Available filters:
- agency
- vendor
- category
- fy
- month

Available group_by values:
- agency
- vendor
- category
- month

Examples:

Question:
largest agencies

Output:
{{
  "group_by": ["agency"],
  "limit": 10
}}

Question:
top vendors for health care authority

Output:
{{
  "filters": {{
    "agency": "Health Care Authority"
  }},
  "group_by": ["vendor"],
  "limit": 10
}}

Question:
top categories

Output:
{{
  "group_by": ["category"],
  "limit": 10
}}

Question:
transportation spending by category

Output:
{{
  "filters": {{
    "agency": "Transportation"
  }},
  "group_by": ["category"],
  "limit": 10
}}

Question:
top vendors in transportation

Output:
{{
  "filters": {{
    "agency": "Transportation"
  }},
  "group_by": ["vendor"],
  "limit": 10
}}

Question:
show spending by category

Output:
{{
  "group_by": ["category"],
  "limit": 10
}}

Question:
which agencies spend the most

Output:
{{
  "group_by": ["agency"],
  "limit": 10
}}

Question:
which vendors receive the most money

Output:
{{
  "group_by": ["vendor"],
  "limit": 10
}}

Rules:

- Only use agency names that appear in VALID AGENCIES.
- Only use category names that appear in VALID CATEGORIES.
- Use exact spelling from the metadata.
- Return ONLY valid JSON.
- No markdown.
- No explanation.

Question:
{question}
"""

    response = client.responses.create(
        model="gpt-5",
        input=prompt
    )

    print("\n====================")
    print("USER QUESTION:")
    print(question)
    print("\nGPT RESPONSE:")
    print(response.output_text)
    print("====================\n")

    spec = json.loads(
        response.output_text
    )

    for field in spec.get("group_by", []):
        if field not in ALLOWED_GROUPS:
            raise ValueError(
                f"Invalid group_by value: {field}"
            )

    return spec