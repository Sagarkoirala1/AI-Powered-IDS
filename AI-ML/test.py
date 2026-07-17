import joblib

model = joblib.load("model_logistic_regression.joblib")
scaler = joblib.load("scaler.joblib")
encoder = joblib.load("label_encoder.joblib")

print("Model:", type(model))
print("Scaler:", type(scaler))
print("Encoder:", type(encoder))

print("Everything loaded successfully!")