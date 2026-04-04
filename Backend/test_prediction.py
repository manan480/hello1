import json
import os
from dotenv import load_dotenv
from openai import OpenAI
import traceback

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

system_prompt = "You are a helpful AI assistant."
user_message = "Test"

try:
    print(f"API Key present: {bool(os.getenv('GEMINI_API_KEY'))}")
    response = client.chat.completions.create(
        model="gemini-2.5-flash",
        response_format={"type": "json_object"},
        temperature=0.1,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    )
    print("Success")
    print(response.choices[0].message.content)
except Exception as e:
    print("Exception from OpenAI API:")
    print(type(e).__name__, str(e))
    traceback.print_exc()
