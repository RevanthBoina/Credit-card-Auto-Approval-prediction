"""
Credit Card Approval Prediction API (Flask, API-only backend).

Serves a trained scikit-learn pipeline over a JSON API.
The Next.js frontend calls this via /api/predict proxy route.

Routes:
    GET  /health    -> liveness + model-loaded check
    POST /predict   -> run inference, returns JSON prediction

New Schema (13 fields - NO Credit Score):
    Age, Debt, YearsEmployed, Gender, Married, BankCustomer,
    EducationLevel, Ethnicity, PriorDefault, Employed, DriversLicense,
    Citizen, Income

Run with:
    FLASK_DEBUG=1 FLASK_PORT=8080 python app.py      # local dev
    python app.py                                     # prod-ish defaults
"""

import logging
import os

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("credit_approval_api")

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "*"}})

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "credit_approval_model.pkl")

_model = None


def get_model():
    """Lazy-load the model once and cache it in the module-level variable."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found at {MODEL_PATH}. "
                "Run the training script to generate it: "
                "python train_model.py"
            )
        _model = joblib.load(MODEL_PATH)
        logger.info("Model loaded from %s", MODEL_PATH)
    return _model


# ---------------------------------------------------------------------------
# Feature columns – must match the order used during training exactly.
# ---------------------------------------------------------------------------
FEATURE_COLUMNS = [
    "Age", "Debt", "YearsEmployed", "Gender", "Married",
    "BankCustomer", "EducationLevel", "Ethnicity", "PriorDefault",
    "Employed", "DriversLicense", "Citizen", "Income",
]


# ---------------------------------------------------------------------------
# Valid values for categorical fields
# ---------------------------------------------------------------------------
VALID_GENDER = {"Male", "Female"}
VALID_YES_NO = {"Yes", "No"}
VALID_EDUCATION = {
    "high_school", "bachelors", "masters", "phd", "none"
}
VALID_ETHNICITY = {
    "white", "black", "asian", "latino", "other"
}
VALID_CITIZEN = {
    "by birth", "by other means", "temporary"
}


# ---------------------------------------------------------------------------
# Request contract:
#   POST /predict
#   {
#     "Age": 35,
#     "Debt": 5000,
#     "YearsEmployed": 5,
#     "Gender": "Male",
#     "Married": "Yes",
#     "BankCustomer": "Yes",
#     "EducationLevel": "bachelors",
#     "Ethnicity": "white",
#     "PriorDefault": "No",
#     "Employed": "Yes",
#     "DriversLicense": "Yes",
#     "Citizen": "by birth",
#     "Income": 50000
#   }
# ---------------------------------------------------------------------------
REQUIRED_FIELDS = [
    "Age", "Debt", "YearsEmployed", "Gender", "Married",
    "BankCustomer", "EducationLevel", "Ethnicity", "PriorDefault",
    "Employed", "DriversLicense", "Citizen", "Income",
]


def _require_number(value, field_name, allow_negative=False):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"'{field_name}' must be a number.")
    if not allow_negative and value < 0:
        raise ValueError(f"'{field_name}' must not be negative.")
    return float(value)


def _require_yes_no(value, field_name):
    if not isinstance(value, str) or value not in VALID_YES_NO:
        raise ValueError(f"'{field_name}' must be 'Yes' or 'No'.")
    return value


def _require_choice(value, field_name, valid_set):
    if not isinstance(value, str) or value not in valid_set:
        raise ValueError(f"'{field_name}' must be one of {sorted(valid_set)}.")
    return value


def validate_and_transform(payload: dict) -> dict:
    """Validate the incoming JSON payload and map it onto FEATURE_COLUMNS.

    Raises ValueError with a human-readable message on the first invalid field.
    """
    missing = [f for f in REQUIRED_FIELDS if f not in payload or payload[f] is None]
    if missing:
        raise ValueError(f"Missing required field(s): {', '.join(missing)}.")

    row = {}

    # Numeric fields
    row["Age"] = int(_require_number(payload["Age"], "Age"))
    row["Debt"] = _require_number(payload["Debt"], "Debt")
    row["YearsEmployed"] = _require_number(payload["YearsEmployed"], "YearsEmployed")
    row["Income"] = _require_number(payload["Income"], "Income", allow_negative=False)

    # Categorical fields
    row["Gender"] = _require_choice(payload["Gender"], "Gender", VALID_GENDER)
    row["Married"] = _require_yes_no(payload["Married"], "Married")
    row["BankCustomer"] = _require_yes_no(payload["BankCustomer"], "BankCustomer")
    row["EducationLevel"] = _require_choice(payload["EducationLevel"], "EducationLevel", VALID_EDUCATION)
    row["Ethnicity"] = _require_choice(payload["Ethnicity"], "Ethnicity", VALID_ETHNICITY)
    row["PriorDefault"] = _require_yes_no(payload["PriorDefault"], "PriorDefault")
    row["Employed"] = _require_yes_no(payload["Employed"], "Employed")
    row["DriversLicense"] = _require_yes_no(payload["DriversLicense"], "DriversLicense")
    row["Citizen"] = _require_choice(payload["Citizen"], "Citizen", VALID_CITIZEN)

    return row


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/", methods=["GET"])
def root():
    """Lightweight liveness route for infra health probes."""
    return jsonify({"success": True, "service": "credit-approval-api"}), 200


@app.route("/health", methods=["GET"])
def health():
    """Liveness probe. Reports whether the model is loaded/loadable."""
    try:
        get_model()
        model_ok = True
        detail = None
    except Exception as exc:
        model_ok = False
        detail = str(exc)
        logger.warning("Health check: model not ready: %s", detail)

    return jsonify({
        "success": model_ok,
        "status": "ok" if model_ok else "degraded",
        "model_loaded": model_ok,
        **({"detail": detail} if detail else {}),
    }), 200 if model_ok else 503


@app.route("/predict", methods=["POST"])
def predict():
    """Run inference on a JSON payload and return a JSON prediction."""
    payload = request.get_json(silent=True)
    if payload is None or not isinstance(payload, dict):
        return jsonify({"success": False, "error": "Request body must be valid JSON."}), 400

    try:
        raw_values = validate_and_transform(payload)
    except ValueError as exc:
        logger.info("Validation failed: %s", exc)
        return jsonify({"success": False, "error": str(exc)}), 422

    try:
        input_df = pd.DataFrame([raw_values], columns=FEATURE_COLUMNS)
        model = get_model()
        prediction_int = int(model.predict(input_df)[0])
        probability = float(model.predict_proba(input_df)[0][1])
    except FileNotFoundError as exc:
        logger.error("Model file missing: %s", exc)
        return jsonify({"success": False, "error": "Model is not available on the server."}), 503
    except Exception as exc:
        logger.exception("Inference failed")
        return jsonify({"success": False, "error": "Prediction failed due to an internal error."}), 500

    return jsonify({
        "success": True,
        "prediction": prediction_int,
        "prediction_label": "Approved" if prediction_int == 1 else "Rejected",
        "probability": round(probability, 4),
    }), 200


@app.errorhandler(404)
def not_found(_e):
    return jsonify({"success": False, "error": "Not found."}), 404


@app.errorhandler(405)
def method_not_allowed(_e):
    return jsonify({"success": False, "error": "Method not allowed."}), 405


@app.errorhandler(500)
def internal_error(_e):
    logger.exception("Unhandled server error")
    return jsonify({"success": False, "error": "Internal server error."}), 500


if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() in ("1", "true", "yes")
    port = int(os.environ.get("FLASK_PORT", os.environ.get("PORT", 8080)))
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    logger.info("Starting Flask API on %s:%s (debug=%s)", host, port, debug_mode)
    app.run(host=host, port=port, debug=debug_mode)
