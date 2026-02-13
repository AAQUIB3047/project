import json

import requests

print("\n=== Testing API ===\n")

try:
    r = requests.get('http://localhost:8000/api/events/', timeout=5)
    print(f"Status Code: {r.status_code}")
    print(f"Content-Type: {r.headers.get('content-type')}")
    print(f"\nResponse Body:")
    data = r.json()
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")
