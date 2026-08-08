import joblib

print("Loading model and preprocessing files...")

scaler = joblib.load("models/scaler.pkl")
encoder = joblib.load("models/label_encoder.pkl")
model = joblib.load("models/logistic_regression.pkl")

print("Loading X_test...")
X_test = joblib.load("data/processed/X_test.pkl")

print("Loading y_test...")
y_test = joblib.load("data/processed/y_test.pkl")

print("X_test type:", type(X_test))
print("y_test type:", type(y_test))

print("X_test shape:", X_test.shape)
print("y_test shape:", y_test.shape)

# Test first 10 samples
samples = X_test[:10]

# Scale
samples_scaled = scaler.transform(samples)

# Predictions
predictions = model.predict(samples_scaled)
probabilities = model.predict_proba(samples_scaled)

# Convert encoded labels to class names
actual_labels = encoder.inverse_transform(y_test[:10])
predicted_labels = encoder.inverse_transform(predictions)

print()
print("=" * 70)
print("TESTING 10 ORIGINAL TEST SAMPLES")
print("=" * 70)

for i in range(10):

    confidence = float(max(probabilities[i])) * 100

    print(
        f"{i + 1:2}. "
        f"Actual: {actual_labels[i]:20} "
        f"Predicted: {predicted_labels[i]:20} "
        f"Confidence: {confidence:.2f}%"
    )

print("=" * 70)