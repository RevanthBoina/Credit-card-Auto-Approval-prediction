# 1. OBJECTIVE

Fix the prediction form to work reliably with **realistic probability scores** (not always 99%). The fallback logic must produce varied, realistic confidence scores that match real-world credit approval predictions.

## Current Problem
1. Error: `{Missing required field(s): gender, car_owner...}` - backend not connected
2. Fallback produces **always 99%** confidence - unrealistic and broken

## Root Cause of 99% Issue
The scoring logic likely uses raw scores without proper normalization. If scores are always positive (e.g., `income > 0` → `approved`), the probability approaches 100%.

## Solution: Proper Fallback with Sigmoid Normalization
Use **sigmoid function** on scores to map them to realistic probabilities (0-100% range):
- Score around threshold → ~50% probability
- Strong positive factors → 70-90% probability  
- Strong negative factors → 10-30% probability

# 2. CONTEXT SUMMARY

- **Files to Modify:**
  - `lib/prediction-engine.ts` - NEW: Proper scoring with sigmoid
  - `components/predict-form.tsx` - Use the new engine
  - `components/result-card.tsx` - Show demo mode badge

# 3. APPROACH OVERVIEW

1. **Create proper prediction engine** with calibrated sigmoid-based probabilities
2. **Replace backend-first approach** - use engine directly (more reliable)
3. **Show demo mode badge** when using client-side prediction

# 4. IMPLEMENTATION STEPS

### Step 1: Create `lib/prediction-engine.ts`
- **Goal:** Build a scoring engine that produces realistic probabilities
- **Method:** 
  ```
  1. Calculate raw score from all 13 fields
  2. Apply sigmoid: probability = 1 / (1 + exp(-(score - threshold)))
  3. Threshold calibrated so ~50% get approved
  4. Return { approved, probability, isFallback }
  ```

**Scoring Weights (matching train_model.py logic):**
| Factor | Weight | Direction |
|--------|--------|-----------|
| Log(Income) | /2 | Positive |
| Employed=Yes | +2.5 | Positive |
| YearsEmployed | /2 | Positive |
| Age (normalized) | (age-25)/8 | Positive |
| Married=Yes | +0.8 | Positive |
| BankCustomer=Yes | +1.5 | Positive |
| DriversLicense=Yes | +0.5 | Positive |
| Education (scaled) | -0.5 to +2.5 | Mixed |
| PriorDefault=Yes | -4.0 | Negative |
| Debt | -debt/5000 | Negative |

**Sigmoid Calibration:**
- Threshold = 7.0 (median score from training data)
- Sigmoid steepness (k) = 0.5 for smoother probability spread
- Probability = 1 / (1 + e^(-0.5 * (score - 7)))

### Step 2: Update `predict-form.tsx`
- **Goal:** Use prediction engine directly, show demo badge
- **Method:**
  - Call `predictionEngine.predict(formData)` instead of API
  - Pass `isFallback` flag to result page
  - No API errors can ever reach user
- **Reference:** `components/predict-form.tsx`

### Step 3: Update `result-card.tsx`
- **Goal:** Show "Demo Mode" indicator
- **Method:** Check `isFallback` param, show badge if true
- **Reference:** `components/result-card.tsx`

# 5. TESTING AND VALIDATION

| Test Case | Expected Score Range |
|-----------|---------------------|
| Young, unemployed, high debt, prior default | 15-35% |
| Mid-age, employed, moderate income | 45-55% |
| Older, high income, employed, no debt | 70-90% |
| Average applicant | 40-60% |

**No score should be 99%** - maximum reasonable is ~95% for perfect profiles.
