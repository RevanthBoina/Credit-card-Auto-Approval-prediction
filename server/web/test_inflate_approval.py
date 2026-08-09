"""Standalone tests for the approval-probability inflation helper.

Run with:
    python test_inflate_approval.py

These tests exercise only the pure-Python remap logic (no ML/Flask deps),
so they run anywhere a plain Python interpreter is available.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

# Import the helper directly from the app module without triggering Flask
# import side-effects by reading the function via importlib on app.py.
import importlib.util

_spec = importlib.util.spec_from_file_location(
    "credit_approval_app", os.path.join(os.path.dirname(__file__), "app.py")
)
# app.py imports flask/pandas/etc at module load. To keep these tests
# dependency-free, exec only the helper definition by sourcing the file
# inside a namespace where the heavy imports are stubbed.
import types

_module = types.ModuleType("credit_approval_app")
namespace = {
    "__name__": "credit_approval_app",
    "os": os,
    "logging": __import__("logging"),
}


def _load_helper():
    """Extract inflate_approval_probability and its constants from app.py."""
    source = open(app_path()).read()
    # Pull just the block we need: the constants and the function.
    start = source.index("APPROVAL_PROB_MIN_FLOOR")
    end = source.index("def get_model():")
    snippet = source[start:end]
    exec(snippet, namespace)
    return namespace


def app_path():
    return os.path.join(os.path.dirname(__file__), "app.py")


ns = _load_helper()
inflate = ns["inflate_approval_probability"]
FLOOR = ns["APPROVAL_PROB_MIN_FLOOR"]

_failures = []


def check(name, cond):
    if cond:
        print(f"  PASS: {name}")
    else:
        print(f"  FAIL: {name}")
        _failures.append(name)


def approx(a, b, tol=1e-9):
    return math.isclose(a, b, rel_tol=tol, abs_tol=tol)


print("Running inflate_approval_probability tests")

# 1. Approved at exactly 0.5 -> remap start -> floor (0.65), >= raw.
check("approved 0.5 -> floor 0.65", approx(inflate(0.5, True), FLOOR))
check("approved 0.5 inflated >= raw", inflate(0.5, True) >= 0.5)

# 2. Approved at 1.0 -> 1.0 (ceiling preserved).
check("approved 1.0 -> 1.0", approx(inflate(1.0, True), 1.0))

# 3. Approved at 0.75 (mid band) -> floor + 0.5*(1-floor) = 0.65 + 0.175 = 0.825
check("approved 0.75 -> 0.825", approx(inflate(0.75, True), FLOOR + 0.5 * (1 - FLOOR)))
check("approved 0.75 inflated > raw", inflate(0.75, True) > 0.75)

# 4. Monotonic increase across approval band.
prev = inflate(0.5, True)
mono = True
for p in [0.55, 0.6, 0.7, 0.8, 0.9, 0.99, 1.0]:
    cur = inflate(p, True)
    if cur < prev - 1e-12:
        mono = False
    prev = cur
check("approved band monotonic non-decreasing", mono)

# 5. Always >= raw for approved inputs.
all_ge = all(inflate(p, True) >= p - 1e-12 for p in [0.5, 0.55, 0.7, 0.9, 1.0])
check("approved always >= raw", all_ge)

# 6. Never exceeds 1.0 for approved.
le_one = all(inflate(p, True) <= 1.0 + 1e-12 for p in [0.5, 0.7, 0.9, 1.0])
check("approved never > 1.0", le_one)

# 7. Rejected (< 0.5) is unchanged.
for p in [0.0, 0.1, 0.25, 0.49]:
    check(f"rejected {p} unchanged", approx(inflate(p, False), p))

# 8. Verdict never flips: rejected stays < 0.5, approved stays >= floor > 0.5.
check("rejected stays < 0.5", inflate(0.49, False) < 0.5)
check("approved stays > 0.5", inflate(0.5, True) > 0.5)

if _failures:
    print(f"\nFAILED: {len(_failures)} check(s): {_failures}")
    sys.exit(1)
print("\nAll checks passed.")
