from pathlib import Path

import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA


class FeatureEngineering:

    def __init__(self, df, use_pca=False, n_components=0.95):
        self.df = df
        self.use_pca = use_pca
        self.n_components = n_components

    # ----------------------------------
    # Filter Required Classes
    # ----------------------------------
    def filter_classes(self):

        label_map = {

            "BENIGN": "BENIGN",

            "DDoS": "DDoS",

            "PortScan": "PortScan",

            "FTP-Patator": "BruteForce",
            "SSH-Patator": "BruteForce",

            "Bot": "UnauthorizedAccess",
            "Infiltration": "UnauthorizedAccess",

            "Web Attack – Brute Force": "UnauthorizedAccess",
            "Web Attack – XSS": "UnauthorizedAccess",
            "Web Attack – Sql Injection": "UnauthorizedAccess"

        }

        self.df = self.df[
            self.df["Label"].isin(label_map.keys())
        ].copy()

        self.df["Label"] = self.df["Label"].map(label_map)

        print("\nClass Distribution\n")
        print(self.df["Label"].value_counts())

    # ----------------------------------
    # Split Features & Labels
    # ----------------------------------
    def split_xy(self):

        X = self.df.drop(
            columns=["Label"]
        )

        y = self.df["Label"]


        # Save feature names
        Path("models").mkdir(
            exist_ok=True
        )

        feature_names = X.columns.tolist()


        joblib.dump(
            feature_names,
            "models/feature_names.pkl"
        )


        print(
            f"\nTotal Features : {len(feature_names)}"
        )


        return X, y

    # ----------------------------------
    # Encode Labels
    # ----------------------------------
    def encode_labels(self, y):

        encoder = LabelEncoder()

        y = encoder.fit_transform(y)

        Path("models").mkdir(exist_ok=True)

        joblib.dump(
            encoder,
            "models/label_encoder.pkl"
        )

        print("\nLabel Mapping")

        for i, c in enumerate(encoder.classes_):
            print(f"{i} -> {c}")

        return y

    # ----------------------------------
    # Train Test Split
    # ----------------------------------
    def split_dataset(self, X, y):

        return train_test_split(
            X,
            y,
            test_size=0.20,
            random_state=42,
            stratify=y
        )

    # ----------------------------------
    # Scaling
    # ----------------------------------
    def scale(self, X_train, X_test):

        scaler = StandardScaler()



        X_test = scaler.transform(X_test)

        joblib.dump(
            scaler,
            "models/scaler.pkl"
        )

        return X_train, X_test

    # ----------------------------------
    # PCA (Optional)
    # ----------------------------------
    def apply_pca(self, X_train, X_test):

        pca = PCA(
            n_components=self.n_components,
            random_state=42
        )

        X_train = pca.fit_transform(X_train)

        X_test = pca.transform(X_test)

        joblib.dump(
            pca,
            "models/pca.pkl"
        )

        print(
            f"\nPCA Components : {pca.n_components_}"
        )

        return X_train, X_test

    # ----------------------------------
    # Complete Pipeline
    # ----------------------------------
# ----------------------------------
# Complete Pipeline
# ----------------------------------
    def process(self):

        self.filter_classes()

        X, y = self.split_xy()

        y = self.encode_labels(y)

        X_train, X_test, y_train, y_test = self.split_dataset(
            X,
            y
        )

        X_train, X_test = self.scale(
            X_train,
            X_test
        )

        if self.use_pca:

            X_train, X_test = self.apply_pca(
                X_train,
                X_test
            )

        # =====================================
        # Save Processed Dataset
        # =====================================

        Path("data/processed").mkdir(
            parents=True,
            exist_ok=True
        )

        joblib.dump(
            X_train,
            "data/processed/X_train.pkl"
        )

        joblib.dump(
            X_test,
            "data/processed/X_test.pkl"
        )

        joblib.dump(
            y_train,
            "data/processed/y_train.pkl"
        )

        joblib.dump(
            y_test,
            "data/processed/y_test.pkl"
        )

        print("\nProcessed datasets saved.")

        print("data/processed/X_train.pkl")
        print("data/processed/X_test.pkl")
        print("data/processed/y_train.pkl")
        print("data/processed/y_test.pkl")

        print("\nFeature Engineering Completed.")

        return X_train, X_test, y_train, y_test