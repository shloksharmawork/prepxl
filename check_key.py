import requests
import json

url = "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCqSUnCHQth9lr-SEYnJp5spkJ4kQhZ9WM"
response = requests.get(url)
models = response.json().get('models', [])
for m in models:
    if 'gemini-2.0-flash-exp' in m['name']:
        print(f"Name: {m['name']}, Methods: {m.get('supportedGenerationMethods', [])}")
