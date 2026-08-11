$root = $PSScriptRoot

# 1. Start AI-ML API (Uvicorn / FastAPI)
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\AI-ML'; conda activate intrusion; uvicorn predictor_api:app --host 127.0.0.1 --port 8000 --reload"
)

# 2. Start Live Packet Sniffer (Requires Administrator / Npcap)
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\AI-ML'; conda activate intrusion; python -m network.sniffer"
) -Verb RunAs

# 3. Start Backend (Node.js / Express)
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\backend'; conda activate intrusion; npm run dev"
)

# 4. Start Frontend (React / Vite)
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\frontend'; npm run dev"
)

Write-Host " All services and live packet sniffer are launching!" -ForegroundColor Green