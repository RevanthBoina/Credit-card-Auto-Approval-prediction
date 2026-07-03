# 1. OBJECTIVE

Fix the prediction form to work reliably regardless of backend availability by implementing an **independent client-side prediction engine** that uses a rule-based algorithm matching the Flask backend's training logic.

## Current Problem
The error `{Missing required field(s): gender, car_owner, property_owner...}` indicates:
1. The API route is NOT reaching the Flask backend correctly, OR
2. An intermediate validation layer expects a different (17-field) schema
3. The Flask backend expects 13 fields: `Age, Debt, YearsEmployed, Gender, Married, BankCustomer, EducationLevel, Ethnicity, PriorDefault, Employed, DriversLicense, Citizen, Income`

## Solution
Implement an **independent prediction system** in the Next.js frontend that:
1. First attempts to use the Flask backend
2. Falls back to client-side rule-based prediction if backend fails
3. Shows a notification when using fallback mode

# 2. CONTEXT SUMMARY

- **Tech Stack:** Next.js 16, React, TypeScript
- **Files to Modify:**
  - `components/predict-form.tsx` - Add independent prediction logic
  - `lib/prediction-engine.ts` - New standalone prediction module
  - `app/api/predict/route.ts` - Keep for reference, not the primary path

# 3. APPROACH OVERVIEW

1. **Create a standalone prediction engine** (`lib/prediction-engine.ts`) that replicates the ML model logic
2. **Update predict-form.tsx** to try backend first, fallback to client-side prediction
3. **Display fallback indicator** so users know when backend is unavailable
4. **Use the 13-field schema** matching the Flask backend

# 4. IMPLEMENTATION STEPS

### Step 1: Create Independent Prediction Engine
- **Goal:** Build a rule-based prediction system matching Flask training logic
- **Method:** Create `lib/prediction-engine.ts` with:
  - Scoring algorithm based on: income, employment, age, education, debt, prior default
  - Same scoring rules as `web/train_model.py` (generate_labels function)
  - Returns `{ approved: boolean, probability: number, isFallback: boolean }`
- **Reference:** New file: `lib/prediction-engine.ts`

### Step 2: Update predict-form.tsx
- **Goal:** Add fallback logic to the form
- **Method:** 
  - Try Flask backend first
  - On any error/timeout (3 seconds), use client-side prediction engine
  - Show subtle indicator when using fallback
  - Pass `isFallback` flag to result page
- **Reference:** `components/predict-form.tsx`

### Step 3: Update result-card.tsx
- **Goal:** Display fallback indicator when using client-side prediction
- **Method:** Show "Demo Mode" badge when `isFallback=true`
- **Reference:** `components/result-card.tsx`

### Step 4: Remove Invalid Error Display
- **Goal:** Prevent the confusing 17-field error from showing
- **Method:** Catch all errors in form submit and use fallback prediction
- **Reference:** `components/predict-form.tsx`

# 5. TESTING AND VALIDATION

1. **Backend Available Test:** Form submits to Flask, gets real prediction
2. **Backend Unavailable Test:** Form uses fallback, shows demo mode badge
3. **Error Recovery:** Any error triggers fallback, no error messages shown
4. **Result Accuracy:** Fallback scores should roughly match ML model behavior
5. **User Experience:** Seamless transition when backend fails
