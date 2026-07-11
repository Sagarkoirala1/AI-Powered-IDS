import joblib

model = joblib.load("ids_model.pkl")
scaler = joblib.load("scaler.pkl")
encoder = joblib.load("encoder.pkl")

print("Model:", type(model))
print("Scaler:", type(scaler))
print("Encoder:", type(encoder))

print("Everything loaded successfully!")