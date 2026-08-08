from pathlib import Path
import time
import joblib


class BaseModel:

    def __init__(self):
        Path("models").mkdir(exist_ok=True)

    def save_model(self, model, filename):
        """
        Save trained model
        """
        path = Path("models") / filename
        joblib.dump(model, path)
        print(f"Model saved: {path}")

    def measure_training_time(self, model, X_train, y_train):
        """
        Train model and return training time
        """
        start = time.perf_counter()

        model.fit(X_train, y_train)

        training_time = time.perf_counter() - start

        return model, training_time

    def measure_prediction_time(self, model, X_test):
        """
        Predict and return prediction time
        """
        start = time.perf_counter()

        predictions = model.predict(X_test)

        prediction_time = time.perf_counter() - start

        return predictions, prediction_time