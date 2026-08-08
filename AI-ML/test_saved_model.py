import joblib
import pandas as pd
import numpy as np

print("=" * 70)
print("TESTING SAVED XGBOOST MODEL ON TRAINING DATA")
print("=" * 70)

# --------------------------------------------------
# Load dataset
# --------------------------------------------------

df = pd.read_csv(
    "data/processed/cleaned.csv",
    low_memory=False
)

print("Dataset shape:", df.shape)

# --------------------------------------------------
# Load saved objects
# --------------------------------------------------

model = joblib.load("models/xgboost.pkl")
scaler = joblib.load("models/scaler.pkl")
encoder = joblib.load("models/label_encoder.pkl")
feature_names = joblib.load("models/feature_names.pkl")

print("Features:", len(feature_names))
print("Classes:", encoder.classes_)

# --------------------------------------------------
# Prepare X
# --------------------------------------------------

X = df[feature_names].copy()

# --------------------------------------------------
# Prepare labels
# --------------------------------------------------

label_mapping = {

    "BENIGN": "BENIGN",

    "DDoS": "DDoS",

    "PortScan": "PortScan",

    "FTP-Patator": "BruteForce",
    "SSH-Patator": "BruteForce",

    "Bot": "UnauthorizedAccess",
    "Infiltration": "UnauthorizedAccess",

    "Web Attack � Brute Force": "UnauthorizedAccess",
    "Web Attack � XSS": "UnauthorizedAccess",
    "Web Attack � Sql Injection": "UnauthorizedAccess",
}

df["Mapped_Label"] = df["Label"].map(label_mapping)

unknown_labels = df.loc[
    df["Mapped_Label"].isna(),
    "Label"
].unique()

if len(unknown_labels) > 0:

    print("\nIgnoring labels not used during training:")
    print(unknown_labels)

    df = df[
        df["Mapped_Label"].notna()
    ].copy()

print("\nLabel mapping successful.")

print(
    df["Mapped_Label"].value_counts()
)
# --------------------------------------------------
# Select samples from every class
# --------------------------------------------------

test_parts = []

for class_name in encoder.classes_:

    class_df = df[df["Mapped_Label"] == class_name]

    if len(class_df) == 0:
        continue

    sample = class_df.sample(
        n=min(20, len(class_df)),
        random_state=42
    )

    test_parts.append(sample)

test_df = pd.concat(
    test_parts,
    ignore_index=True
)

X_test = test_df[feature_names]

y_test = encoder.transform(
    test_df["Mapped_Label"]
)

# --------------------------------------------------
# Scale
# --------------------------------------------------

X_test_scaled = scaler.transform(X_test)

# --------------------------------------------------
# Predict
# --------------------------------------------------

predictions = model.predict(X_test_scaled)

predicted_labels = encoder.inverse_transform(
    predictions.astype(int)
)

# --------------------------------------------------
# Results
# --------------------------------------------------

print("\n" + "=" * 70)
print("PREDICTIONS")
print("=" * 70)

for actual, predicted in zip(
    test_df["Label"],
    predicted_labels
):

    print(
        f"Actual: {actual:20} "
        f"Predicted: {predicted}"
    )

# --------------------------------------------------
# Accuracy
# --------------------------------------------------

accuracy = np.mean(
    predicted_labels == test_df["Mapped_Label"].values
)

print("\n" + "=" * 70)
print("RESULT")
print("=" * 70)

print(
    f"Accuracy: {accuracy * 100:.2f}%"
)