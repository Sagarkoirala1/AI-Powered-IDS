import joblib
import numpy as np
from sklearn.metrics import accuracy_score, classification_report

print("=" * 60)
print("XGBOOST TEST ON TEST DATA")
print("=" * 60)

print("Loading model...")
model = joblib.load("models/xgboost.pkl")

print("Loading encoder...")
encoder = joblib.load("models/label_encoder.pkl")

print("Loading X_test...")
X_test = joblib.load("data/processed/X_test.pkl")

print("Loading y_test...")
y_test = joblib.load("data/processed/y_test.pkl")

print()
print("X_test shape:", X_test.shape)
print("y_test shape:", y_test.shape)

# --------------------------------------------------
# Check feature count
# --------------------------------------------------

if X_test.shape[1] != 70:
    raise ValueError(
        f"Expected 70 features, got {X_test.shape[1]}"
    )

print("Feature count: 70 ✓")

# --------------------------------------------------
# Prediction
# --------------------------------------------------

print()
print("Running XGBoost prediction...")

y_pred = model.predict(X_test)

# --------------------------------------------------
# Accuracy
# --------------------------------------------------

accuracy = accuracy_score(
    y_test,
    y_pred
)

print()
print("=" * 60)
print("XGBOOST RESULTS")
print("=" * 60)

print(
    f"Accuracy: {accuracy * 100:.2f}%"
)

# --------------------------------------------------
# Classification report
# --------------------------------------------------

print()
print("Classification Report:")
print()

print(
    classification_report(
        y_test,
        y_pred,
        target_names=encoder.classes_,
        zero_division=0
    )
)

# --------------------------------------------------
# Sample predictions
# --------------------------------------------------

print("=" * 60)
print("SAMPLE PREDICTIONS")
print("=" * 60)

for i in range(min(10, len(X_test))):

    actual = encoder.inverse_transform(
        [y_test[i]]
    )[0]

    predicted = encoder.inverse_transform(
        [y_pred[i]]
    )[0]

    print(
        f"{i + 1:2}. "
        f"Actual: {actual:<20} "
        f"Predicted: {predicted}"
    )

print("=" * 60)