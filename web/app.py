import os

import joblib
import pandas as pd
from flask import Flask, redirect, render_template, request, url_for

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
# Place your trained pipeline at web/models/final_credit_model_pipeline.pkl
# (download it from Colab using the download cell in your notebook).
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "final_credit_model_pipeline.pkl")

_model = None


def get_model():
    """Lazy-load the model once and cache it in the module-level variable."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found at {MODEL_PATH}. "
                "Download final_credit_model_pipeline.pkl from Colab and place it in web/models/."
            )
        _model = joblib.load(MODEL_PATH)
    return _model


# ---------------------------------------------------------------------------
# Feature columns – must match the order used during training exactly.
# UCI credit card dataset: Time, V1–V28, Amount
# ---------------------------------------------------------------------------
FEATURE_COLUMNS = ["Time"] + [f"V{i}" for i in range(1, 29)] + ["Amount"]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    """Home page."""
    return render_template("index.html")


@app.route("/about")
def about():
    """About page."""
    return render_template("about.html")


@app.route("/predict", methods=["GET", "POST"])
def predict():
    """
    GET  – render the prediction form.
    POST – extract form fields, run model inference, render result inline.
    """
    if request.method == "POST":
        errors = {}
        form_values = {}
        raw_values = {}

        for col in FEATURE_COLUMNS:
            field_name = col.lower()  # form names: "time", "v1"..."v28", "amount"
            raw = request.form.get(field_name, "").strip()
            form_values[field_name] = raw
            if raw == "":
                errors[field_name] = f"{col} is required."
            else:
                try:
                    raw_values[col] = float(raw)
                except ValueError:
                    errors[field_name] = f"{col} must be a number."

        if errors:
            return render_template(
                "predict.html",
                errors=errors,
                form=form_values,
                feature_columns=FEATURE_COLUMNS,
            )

        input_df = pd.DataFrame([raw_values], columns=FEATURE_COLUMNS)

        try:
            model = get_model()
            prediction_int = int(model.predict(input_df)[0])
            probability = float(model.predict_proba(input_df)[0][1])
        except FileNotFoundError as exc:
            return render_template(
                "predict.html",
                model_error=str(exc),
                feature_columns=FEATURE_COLUMNS,
            )
        except Exception as exc:  # noqa: BLE001
            return render_template(
                "predict.html",
                model_error=f"Prediction failed: {exc}",
                feature_columns=FEATURE_COLUMNS,
            )

        label = "Fraudulent" if prediction_int == 1 else "Legitimate"
        label_class = "result--fraud" if prediction_int == 1 else "result--safe"

        return render_template(
            "result.html",
            prediction=label,
            probability=round(probability, 4),
            amount=raw_values.get("Amount"),
            label_class=label_class,
        )

    return render_template("predict.html", feature_columns=FEATURE_COLUMNS)


@app.route("/result")
def result():
    """Direct GET of /result redirects back to the form."""
    return redirect(url_for("predict"))


@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404


if __name__ == "__main__":
    app.run(debug=True)
