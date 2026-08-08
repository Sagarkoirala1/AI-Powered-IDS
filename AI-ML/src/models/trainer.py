import time
from pathlib import Path

import joblib

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier


class ModelTrainer:
    """
    Train and save all machine learning models.
    """

    def __init__(self):

        Path("models").mkdir(parents=True, exist_ok=True)

        self.models = {

            # "Logistic Regression": LogisticRegression(
            #     max_iter=1000,
            #     random_state=42
            # ),

            # "Random Forest": RandomForestClassifier(
            #     n_estimators=200,
            #     random_state=42,
            #     n_jobs=-1
            # ),

            # "SVM": SVC(
            #     kernel="linear",
            #     probability=True,
            #     random_state=42
            # ),

            "XGBoost": XGBClassifier(
                n_estimators=200,
                max_depth=8,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                objective="multi:softprob",
                eval_metric="mlogloss",
                random_state=42,
                n_jobs=-1
            )

        }

    # =====================================================
    # Save Model
    # =====================================================

    def save_model(self, model, filename):

        filepath = Path("models") / filename

        joblib.dump(model, filepath)

        print(f"Model saved -> {filepath}")

    # =====================================================
    # Generic Trainer
    # =====================================================

    def train_model(
        self,
        model,
        model_name,
        filename,
        X_train,
        X_test,
        y_train
    ):

        print("\n" + "=" * 60)
        print(f"Training {model_name}")
        print("=" * 60)

        # --------------------------
        # Training
        # --------------------------

        start = time.perf_counter()

        model.fit(
            X_train,
            y_train
        )

        training_time = time.perf_counter() - start

        # --------------------------
        # Prediction
        # --------------------------

        start = time.perf_counter()

        y_pred = model.predict(
            X_test
        )

        prediction_time = time.perf_counter() - start

        # --------------------------
        # Prediction Probability
        # --------------------------

        if hasattr(model, "predict_proba"):

            y_prob = model.predict_proba(
                X_test
            )

        else:

            y_prob = None

        # --------------------------
        # Save Model
        # --------------------------

        self.save_model(
            model,
            filename
        )

        print(f"Training Time   : {training_time:.3f} sec")
        print(f"Prediction Time : {prediction_time:.3f} sec")

        return {

            "model": model,

            "prediction": y_pred,

            "probability": y_prob,

            "training_time": training_time,

            "prediction_time": prediction_time

        }
        # =====================================================
    # Logistic Regression
    # =====================================================

    def train_logistic_regression(
        self,
        X_train,
        X_test,
        y_train
    ):

        return self.train_model(
            model=self.models["Logistic Regression"],
            model_name="Logistic Regression",
            filename="logistic_regression.pkl",
            X_train=X_train,
            X_test=X_test,
            y_train=y_train
        )

    # =====================================================
    # Random Forest
    # =====================================================

    def train_random_forest(
        self,
        X_train,
        X_test,
        y_train
    ):

        return self.train_model(
            model=self.models["Random Forest"],
            model_name="Random Forest",
            filename="random_forest.pkl",
            X_train=X_train,
            X_test=X_test,
            y_train=y_train
        )

    # =====================================================
    # Support Vector Machine
    # =====================================================

    def train_svm(
        self,
        X_train,
        X_test,
        y_train
    ):

        return self.train_model(
            model=self.models["SVM"],
            model_name="SVM",
            filename="svm.pkl",
            X_train=X_train,
            X_test=X_test,
            y_train=y_train
        )

    # =====================================================
    # XGBoost
    # =====================================================

    def train_xgboost(
        self,
        X_train,
        X_test,
        y_train
    ):

        return self.train_model(
            model=self.models["XGBoost"],
            model_name="XGBoost",
            filename="xgboost.pkl",
            X_train=X_train,
            X_test=X_test,
            y_train=y_train
        )

        # =====================================================
    # Train All Models
    # =====================================================

    def train_all(
        self,
        X_train,
        X_test,
        y_train
    ):

        results = {}

        print("\nStarting Model Training...\n")

        # results["Logistic Regression"] = self.train_logistic_regression(
        #     X_train,
        #     X_test,
        #     y_train
        # )

        # results["Random Forest"] = self.train_random_forest(
        #     X_train,
        #     X_test,
        #     y_train
        # )

        # results["SVM"] = self.train_svm(
        #     X_train,
        #     X_test,
        #     y_train
        # )

        results["XGBoost"] = self.train_xgboost(
            X_train,
            X_test,
            y_train
        )

        print("\n" + "=" * 60)
        print("All Models Trained Successfully")
        print("=" * 60)

        return results