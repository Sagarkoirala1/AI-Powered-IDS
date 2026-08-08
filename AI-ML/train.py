import joblib

from src.models.trainer import ModelTrainer
from src.evaluation.evaluator import Evaluator


def main():

    print("=" * 60)
    print("Loading Processed Dataset")
    print("=" * 60)

    X_train = joblib.load("data/processed/X_train.pkl")
    X_test = joblib.load("data/processed/X_test.pkl")
    y_train = joblib.load("data/processed/y_train.pkl")
    y_test = joblib.load("data/processed/y_test.pkl")

    print("Dataset Loaded Successfully")

    trainer = ModelTrainer()

    results = trainer.train_all(
        X_train,
        X_test,
        y_train
    )

    evaluator = Evaluator()

    metrics = evaluator.evaluate_all(
        results,
        X_test,
        y_test
    )

    print("\nTraining Completed Successfully!")
    print(metrics)


if __name__ == "__main__":
    main()