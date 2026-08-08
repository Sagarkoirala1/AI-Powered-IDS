from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI(title="AI Powered IDS - XGBoost Prediction API")


# =========================================================
# LOAD ML OBJECTS
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "models", "xgboost.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "models", "scaler.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "models", "label_encoder.pkl")
FEATURE_NAMES_PATH = os.path.join(BASE_DIR, "models", "feature_names.pkl")


print("Loading XGBoost model...")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
encoder = joblib.load(ENCODER_PATH)
feature_names = joblib.load(FEATURE_NAMES_PATH)

print("XGBoost model loaded successfully.")
print("Number of features:", len(feature_names))
print("Classes:", encoder.classes_)


# =========================================================
# REQUEST MODEL
# =========================================================

class PredictionRequest(BaseModel):
    features: dict


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "AI Powered IDS XGBoost API Running",
        "features": len(feature_names),
        "classes": encoder.classes_.tolist()
    }


# =========================================================
# PREDICTION
# =========================================================

@app.post("/predict")
def predict(request: PredictionRequest):

    try:

        print("\n======================================")
        print("Prediction request received")
        print("======================================")

        received_features = request.features

        # -------------------------------------------------
        # Check features
        # -------------------------------------------------

        missing_features = [
            feature
            for feature in feature_names
            if feature not in received_features
        ]

        if missing_features:

            print("Missing features:", missing_features)

            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Missing required features",
                    "missing_features": missing_features
                }
            )

        # -------------------------------------------------
        # Create dataframe in EXACT training order
        # -------------------------------------------------

        row = {}

        for feature in feature_names:
            value = received_features[feature]

            # Convert values to float
            try:
                row[feature] = float(value)
            except:
                row[feature] = 0.0

        X = pd.DataFrame(
            [row],
            columns=feature_names
        )

        print("Input shape:", X.shape)

        # -------------------------------------------------
        # Scale
        # -------------------------------------------------

        X_scaled = scaler.transform(X)

        # -------------------------------------------------
        # Predict
        # -------------------------------------------------

        prediction = model.predict(X_scaled)

        prediction_id = int(prediction[0])

        attack_name = encoder.inverse_transform(
            [prediction_id]
        )[0]

        # -------------------------------------------------
        # Confidence
        # -------------------------------------------------

        confidence = None

        if hasattr(model, "predict_proba"):

            probabilities = model.predict_proba(X_scaled)

            confidence = float(
                np.max(probabilities[0]) * 100
            )

        # -------------------------------------------------
        # Result
        # -------------------------------------------------

        detected = attack_name.upper() != "BENIGN"

        print("Prediction:", attack_name)
        print("Confidence:", confidence)
        print("Detected:", detected)
        print("======================================")

        return {
            "success": True,
            "prediction": attack_name,
            "confidence": round(confidence, 2)
            if confidence is not None
            else None,
            "detected": detected
        }

    except HTTPException:
        raise

    except Exception as error:

        print("Prediction error:", str(error))

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )