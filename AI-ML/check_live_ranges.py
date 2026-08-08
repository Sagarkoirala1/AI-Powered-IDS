import pandas as pd

df = pd.read_csv(
    "data/processed/cleaned.csv",
    nrows=100000
)

features = [
    "Destination_Port",
    "Flow_Duration",
    "Total_Fwd_Packets",
    "Total_Backward_Packets",
    "Flow_Bytes_s",
    "Flow_Packets_s",
    "Flow_IAT_Mean",
    "Flow_IAT_Max",
    "Fwd_IAT_Mean",
    "Bwd_IAT_Mean",
    "Down_Up_Ratio",
    "Active_Mean",
    "Active_Max",
    "Idle_Mean",
    "Idle_Max",
]

print("=" * 70)
print("TRAINING DATA FEATURE RANGES")
print("=" * 70)

print(
    df[features].describe().T[
        ["min", "25%", "50%", "75%", "max"]
    ]
)