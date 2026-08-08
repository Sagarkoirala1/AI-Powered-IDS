$root = $PSScriptRoot

# Start AIML
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\AI-ML'; conda activate intrusion; uvicorn predictor_api:app --host 127.0.0.1 --port 8000"
)

# Start Backend
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\backend'; npm run dev"
)

# Start Frontend
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\frontend'; npm run dev"
)