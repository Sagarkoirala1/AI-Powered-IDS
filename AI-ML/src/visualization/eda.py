from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns


class EDA:

    def __init__(self, df):

        self.df = df

        self.output_dir = Path("outputs/figures")

        self.output_dir.mkdir(
            parents=True,
            exist_ok=True
        )

    def dataset_info(self):

        print("=" * 60)
        print("DATASET INFORMATION")
        print("=" * 60)

        print(f"\nShape : {self.df.shape}")

        print("\nColumns")

        print(self.df.columns.tolist())

        print("\nData Types")

        print(self.df.dtypes)

    def missing_values(self):

        missing = self.df.isnull().sum()

        missing = missing[missing > 0]

        print("\nMissing Values")

        print(missing)

    def class_distribution(self):

        plt.figure(figsize=(10,6))

        sns.countplot(
            data=self.df,
            x="Label",
            order=self.df["Label"].value_counts().index
        )

        plt.xticks(rotation=45)

        plt.tight_layout()

        plt.savefig(
            self.output_dir / "class_distribution.png",
            dpi=300
        )

        plt.close()

    def correlation_heatmap(self):

        numeric = self.df.select_dtypes(include="number")

        corr = numeric.corr()

        plt.figure(figsize=(18,14))

        sns.heatmap(
            corr,
            cmap="coolwarm",
            center=0
        )

        plt.tight_layout()

        plt.savefig(
            self.output_dir / "correlation_heatmap.png",
            dpi=300
        )

        plt.close()

    def run(self):

        self.dataset_info()

        self.missing_values()

        self.class_distribution()

        self.correlation_heatmap()

        print("\nEDA Completed.")