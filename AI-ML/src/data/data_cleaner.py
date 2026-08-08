from pathlib import Path
import numpy as np
import pandas as pd


class DataCleaner:
    """
    Cleans the merged CICIDS2017 dataset.
    """

    def __init__(self, input_file="data/processed/merged.csv"):
        self.input_file = Path(input_file)

    def load_data(self):
        print("=" * 60)
        print("Loading merged dataset...")
        print("=" * 60)

        df = pd.read_csv(self.input_file, low_memory=False)

        print(f"Dataset Shape : {df.shape}")

        return df

    def clean_column_names(self, df):

        df.columns = (
            df.columns
            .str.strip()
            .str.replace(" ", "_")
            .str.replace("/", "_")
            .str.replace("-", "_")
        )

        return df

    def remove_duplicates(self, df):

        before = len(df)

        df = df.drop_duplicates()

        print(f"Duplicate rows removed : {before - len(df)}")

        return df

    def replace_infinite(self, df):

        numeric_cols = df.select_dtypes(include=np.number).columns

        df[numeric_cols] = df[numeric_cols].replace(
            [np.inf, -np.inf],
            np.nan
        )

        return df

    def remove_missing(self, df):

        before = len(df)

        df = df.dropna()

        print(f"Rows removed because of NaN : {before - len(df)}")

        return df

    def remove_constant_columns(self, df):

        constant_cols = [
            col
            for col in df.columns
            if df[col].nunique() <= 1
        ]

        if constant_cols:

            print("\nRemoving Constant Columns")

            for col in constant_cols:
                print(col)

            df = df.drop(columns=constant_cols)

        return df

    def save(self, df):

        output = Path("data/processed/cleaned.csv")

        df.to_csv(output, index=False)

        print("\nCleaned dataset saved.")

        print(output)

    def process(self):

        df = self.load_data()

        df = self.clean_column_names(df)

        df = self.remove_duplicates(df)

        df = self.replace_infinite(df)

        df = self.remove_missing(df)

        df = self.remove_constant_columns(df)

        self.save(df)

        return df