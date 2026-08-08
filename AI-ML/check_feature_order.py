import pandas as pd
import joblib

# Training CSV
df = pd.read_csv(
    "data/processed/cleaned.csv",
    nrows=1
)

training_features = [
    col for col in df.columns
    if col != "Label"
]

# Features saved during training
saved_features = joblib.load(
    "models/feature_names.pkl"
)

print("=" * 70)
print("FEATURE ORDER VERIFICATION")
print("=" * 70)

print("\nTraining CSV features :", len(training_features))
print("Saved feature names   :", len(saved_features))

print("\n" + "=" * 70)
print("COMPARISON")
print("=" * 70)

if training_features == saved_features:
    print("✅ Training CSV and feature_names.pkl MATCH EXACTLY")
else:
    print("❌ FEATURE ORDER / NAMES DO NOT MATCH")

    print("\nDifferences:")

    for i, (csv_col, saved_col) in enumerate(
        zip(training_features, saved_features), start=1
    ):
        if csv_col != saved_col:
            print(
                f"Position {i}: "
                f"CSV={csv_col} | "
                f"Saved={saved_col}"
            )

print("\n" + "=" * 70)
print("TRAINING FEATURE ORDER")
print("=" * 70)

for i, col in enumerate(training_features, 1):
    print(f"{i:02d}. {col}")

print("\n" + "=" * 70)
print("SAVED FEATURE ORDER")
print("=" * 70)

for i, col in enumerate(saved_features, 1):
    print(f"{i:02d}. {col}")