"""End-to-end integration test for the /predict endpoint.

Boots the real Flask app with the real (retrained) model and asserts the
full response shape including the approval inflation + rejected floor.

Run with the backend deps installed:
    python test_predict_endpoint.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app import app

client = app.test_client()

GOOD = {
    "Age": 40, "Debt": 5000, "YearsEmployed": 10, "Gender": "Male",
    "Married": "Yes", "BankCustomer": "Yes", "EducationLevel": "bachelors",
    "Ethnicity": "white", "PriorDefault": "No", "Employed": "Yes",
    "DriversLicense": "Yes", "Citizen": "by birth", "Income": 75000,
}
AVERAGE = dict(GOOD, EducationLevel="high_school", Income=45000, Age=30, YearsEmployed=3, Debt=3000)
WORST = dict(GOOD, Age=22, Debt=25000, YearsEmployed=0, Married="No", BankCustomer="No",
             EducationLevel="none", PriorDefault="Yes", Employed="No",
             DriversLicense="No", Citizen="temporary", Income=18000)

fails = []


def check(name, cond):
    print(f"  {'PASS' if cond else 'FAIL'}: {name}")
    if not cond:
        fails.append(name)


print("Integration: /predict endpoint with retrained model + inflation")

r = client.post("/predict", json=GOOD)
d = r.get_json()
check("good -> 200", r.status_code == 200)
check("good success", d.get("success") is True)
check("good approved", d.get("prediction") == 1)
check("good label Approved", d.get("prediction_label") == "Approved")
check("good prob >= raw", d.get("probability") >= d.get("raw_probability", 0))
check("good prob >= 0.65 floor", d.get("probability") >= 0.65)
check("good raw exposed", "raw_probability" in d)

r = client.post("/predict", json=AVERAGE)
d = r.get_json()
print(f"  (average high_school/45k: pred={d['prediction']} "
      f"prob={d['probability']} raw={d['raw_probability']})")
check("average approved (was rejected before)", d.get("prediction") == 1)
check("average prob > raw", d.get("probability") > d.get("raw_probability", 0))

r = client.post("/predict", json=WORST)
d = r.get_json()
print(f"  (worst case: pred={d['prediction']} "
      f"prob={d['probability']} raw={d['raw_probability']})")
check("worst rejected", d.get("prediction") == 0)
check("worst prob floored >= 0.20", d.get("probability") >= 0.20)
check("worst prob < 0.5 (no flip)", d.get("probability") < 0.5)

# Bad payload
r = client.post("/predict", data="not json", content_type="application/json")
check("bad json -> 400", r.status_code == 400)

if fails:
    print(f"\nFAILED: {len(fails)}: {fails}")
    sys.exit(1)
print("\nAll integration checks passed.")
