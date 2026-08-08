from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)


class MetricsCalculator:

    @staticmethod
    def calculate(y_true, y_pred):

        metrics = {

            "Accuracy": accuracy_score(y_true, y_pred),

            "Precision": precision_score(
                y_true,
                y_pred,
                average="weighted",
                zero_division=0
            ),

            "Recall": recall_score(
                y_true,
                y_pred,
                average="weighted",
                zero_division=0
            ),

            "F1 Score": f1_score(
                y_true,
                y_pred,
                average="weighted",
                zero_division=0
            )

        }

        return metrics

    @staticmethod
    def classification(y_true, y_pred):

        return classification_report(
            y_true,
            y_pred,
            output_dict=True,
            zero_division=0
        )

    @staticmethod
    def confusion(y_true, y_pred):

        return confusion_matrix(
            y_true,
            y_pred
        )