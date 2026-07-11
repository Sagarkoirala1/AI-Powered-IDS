from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

# Load artifacts
model = joblib.load("ids_model.pkl")
scaler = joblib.load("scaler.pkl")
encoder = joblib.load("encoder.pkl")

app = FastAPI(title="IDS ML Service")

# Temporary request model
class PredictionRequest(BaseModel):
    features: list[float]

@app.get("/")
def home():
    return {"message": "IDS ML Service Running"}

@app.post("/predict")
def predict(data: PredictionRequest):
    try:
        x = np.array(data.features).reshape(1, -1)

        x_scaled = scaler.transform(x)

        prediction = model.predict(x_scaled)

        label = encoder.inverse_transform(prediction)[0]

        return {
            "success": True,
            "prediction": str(label)
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }