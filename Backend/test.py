import traceback
import sys
from fastapi.testclient import TestClient
from main import app

try:
    client = TestClient(app)
    response = client.post("/signup", json={
        "hospital_name": "Test Hospital",
        "total_beds": 50,
        "total_oxygen": 100,
        "name": "Admin",
        "email": "admin3@example.com",
        "password": "pass"
    })
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print("Exception occurred:")
    traceback.print_exc()
