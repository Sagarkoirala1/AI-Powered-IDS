from pathlib import Path

import pandas as pd


class ReportGenerator:

    def __init__(self):

        Path("outputs/reports").mkdir(
            parents=True,
            exist_ok=True
        )

    def save_metrics(
        self,
        metrics_df
    ):

        metrics_df.to_csv(
            "outputs/reports/metrics.csv",
            index=False
        )

    def save_classification(
        self,
        report,
        model_name
    ):

        pd.DataFrame(report).transpose().to_csv(

            f"outputs/reports/{model_name}_classification_report.csv"

        )