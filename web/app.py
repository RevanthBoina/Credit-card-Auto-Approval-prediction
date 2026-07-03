"""
Credit Card Approval Prediction API (Flask, API-only backend).

Serves the trained scikit-learn pipeline over a small JSON API.
The Next.js frontend (or its /api/predict proxy route) is the only
intended caller. There is no HTML UI here anymore — see
`app/` (Next.js) for the frontend.

Routes:
    GET  /health   -> liveness + model-loaded check
    POST /predict   -> run inference, returns JSON prediction

Run with:
    FLASK_DEBUG=1 FLASK_PORT=8080 python app.py      # local dev
    python app.py                                     # prod-ish defaults
"""

import logging
import os

import joblib
import pandas as pd
from flask import Flask, jsonify, request

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("credit_approval_api")

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "final_credit_model_pipeline.pkl")

_model = None


def get_model():
    """Lazy-load the model once and cache it in the module-level variable."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found at {MODEL_PATH}. "
                "Train the model using the training notebook to generate it, "
                "then place it at web/models/final_credit_model_pipeline.pkl."
            )
        _model = joblib.load(MODEL_PATH)
        logger.info("Model loaded from %s", MODEL_PATH)
    return _model


# ---------------------------------------------------------------------------
# Feature columns – must match the order used during training exactly.
# ---------------------------------------------------------------------------
FEATURE_COLUMNS = [
    "CODE_GENDER", "FLAG_OWN_CAR", "FLAG_OWN_REALTY",
    "NAME_INCOME_TYPE", "NAME_EDUCATION_TYPE",
    "NAME_FAMILY_STATUS", "NAME_HOUSING_TYPE", "OCCUPATION_TYPE",
    "CNT_CHILDREN", "AMT_INCOME_TOTAL", "DAYS_BIRTH",
    "DAYS_EMPLOYED", "FLAG_MOBIL", "FLAG_WORK_PHONE",
    "FLAG_PHONE", "FLAG_EMAIL", "CNT_FAM_MEMBERS",
]

# ---------------------------------------------------------------------------
# Request contract:
#   POST /predict
#   {
#     "gender": "Male", "car_owner": "Yes", "property_owner": "No",
#     "children": 1, "annual_income": 500000, "income_type": "Working",
#     "education_type": "Higher education", "family_status": "Married",
#     "housing_type": "House / apartment", "birthday_count": -12000,
#     "employed_days": -2000, "mobile_phone": 1, "work_phone": 0,
#     "phone": 1, "email_id": 1, "occupation_type": "Laborers",
#     "family_members": 3
#   }
# Each entry below: request field -> (model column, validator/transform)
# ---------------------------------------------------------------------------
YES_NO_MAP = {"Yes": "Y", "No": "N"}
GENDER_MAP = {"Male": "M", "Female": "F"}

REQUIRED_FIELDS = [
    "gender", "car_owner", "property_owner", "children", "annual_income",
    "income_type", "education_type", "family_status", "housing_type",
    "birthday_count", "employed_days", "mobile_phone", "work_phone",
    "phone", "email_id", "occupation_type", "family_members",
]


def _require_number(value, field_name, allow_negative=True):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"'{field_name}' must be a number.")
    if not allow_negative and value < 0:
        raise ValueError(f"'{field_name}' must not be negative.")
    return value


def _require_choice(value, field_name, mapping):
    if not isinstance(value, str) or value not in mapping:
        raise ValueError(f"'{field_name}' must be one of {list(mapping.keys())}.")
    return mapping[value]


def _require_string(value, field_name):
    if not isinstance(value, str) or value.strip() == "":
        raise ValueError(f"'{field_name}' must be a non-empty string.")
    return value.strip()


def _require_binary_flag(value, field_name):
    if isinstance(value, bool):
        return 1 if value else 0
    if value in (0, 1):
        return int(value)
    raise ValueError(f"'{field_name}' must be 0 or 1.")


def validate_and_transform(payload: dict) -> dict:
    """Validate the incoming JSON payload and map it onto FEATURE_COLUMNS.

    Raises ValueError with a human-readable message on the first invalid field.
    """
    missing = [f for f in REQUIRED_FIELDS if f not in payload or payload[f] is None]
    if missing:
        raise ValueError(f"Missing required field(s): {', '.join(missing)}.")

    row = {}
    row["CODE_GENDER"] = _require_choice(payload["gender"], "gender", GENDER_MAP)
    row["FLAG_OWN_CAR"] = _require_choice(payload["car_owner"], "car_owner", YES_NO_MAP)
    row["FLAG_OWN_REALTY"] = _require_choice(payload["property_owner"], "property_owner", YES_NO_MAP)
    row["NAME_INCOME_TYPE"] = _require_string(payload["income_type"], "income_type")
    row["NAME_EDUCATION_TYPE"] = _require_string(payload["education_type"], "education_type")
    row["NAME_FAMILY_STATUS"] = _require_string(payload["family_status"], "family_status")
    row["NAME_HOUSING_TYPE"] = _require_string(payload["housing_type"], "housing_type")
    row["OCCUPATION_TYPE"] = _require_string(payload["occupation_type"], "occupation_type")

    children = _require_number(payload["children"], "children", allow_negative=False)
    row["CNT_CHILDREN"] = int(children)

    income = _require_number(payload["annual_income"], "annual_income", allow_negative=False)
    row["AMT_INCOME_TOTAL"] = float(income)

    row["DAYS_BIRTH"] = float(_require_number(payload["birthday_count"], "birthday_count"))
    row["DAYS_EMPLOYED"] = float(_require_number(payload["employed_days"], "employed_days"))

    row["FLAG_MOBIL"] = _require_binary_flag(payload["mobile_phone"], "mobile_phone")
    row["FLAG_WORK_PHONE"] = _require_binary_flag(payload["work_phone"], "work_phone")
    row["FLAG_PHONE"] = _require_binary_flag(payload["phone"], "phone")
    row["FLAG_EMAIL"] = _require_binary_flag(payload["email_id"], "email_id")

    fam_members = _require_number(payload["family_members"], "family_members", allow_negative=False)
    row["CNT_FAM_MEMBERS"] = float(fam_members)

    return row


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    """Liveness probe. Reports whether the model is loaded/loadable."""
    try:
        get_model()
        model_ok = True
        detail = None
    except Exception as exc:  # noqa: BLE001 - report any load failure to caller
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
    except Exception as exc:  # noqa: BLE001 - surface a clean error, log the details
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
