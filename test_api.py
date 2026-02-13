import requests

try:
    response = requests.get('http://localhost:8000/api/events/')
    print(f'Status: {response.status_code}')
    print(f'Content-Type: {response.headers.get("content-type")}')
    if response.status_code == 401:
        print('Error: Authentication required')
        print(f'Body: {response.json()}')
    elif response.status_code == 200:
        data = response.json()
        print(f'Success! Events count: {len(data)}')
        if data:
            print(f'Sample event: {data[0]}')
except Exception as e:
    print(f'Exception: {e}')
