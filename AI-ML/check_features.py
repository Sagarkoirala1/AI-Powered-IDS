import pandas as pd

df = pd.read_csv(
    "data/processed/cleaned.csv",
    nrows=1
)

print("=" * 60)
print("TRAINING DATA FEATURE CHECK")
print("=" * 60)

print("Number of columns:", len(df.columns))
print()

for i, col in enumerate(df.columns):
    print(f"{i+1:02d}. {col}")