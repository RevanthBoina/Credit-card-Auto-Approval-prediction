/**
 * Client-side prediction engine for Credit Card Approval.
 * 
 * Uses calibrated sigmoid function to produce realistic probabilities.
 * Score around threshold → ~50%, strong positive → 70-90%, strong negative → 10-30%
 * 
 * Schema (13 fields):
 *   Age, Debt, YearsEmployed, Gender, Married, BankCustomer,
 *   EducationLevel, Ethnicity, PriorDefault, Employed, DriversLicense,
 *   Citizen, Income
 */

export interface PredictionInput {
  Age: number
  Debt: number
  YearsEmployed: number
  Gender: string
  Married: string
  BankCustomer: string
  EducationLevel: string
  Ethnicity: string
  PriorDefault: string
  Employed: string
  DriversLicense: string
  Citizen: string
  Income: number
}

export interface PredictionResult {
  approved: boolean
  probability: number
  isFallback: boolean
  score: number
}

// Sigmoid calibration constants
// Lowered threshold + amplified income so the fallback ("Demo Mode") produces
// approval rates and probabilities comparable to the retrained backend model
// (~65% approval rate for typical applicants), instead of rejecting most
// normal profiles.
const THRESHOLD = 11.0  // Score where probability = 50%
const STEEPNESS = 0.5  // Lower = smoother spread of probabilities

/**
 * Calculate raw approval score from applicant data.
 */
function calculateScore(data: PredictionInput): number {
  let score = 0

  // Income contribution (log scale, most important factor) - amplified so
  // income moves the probability meaningfully.
  score += Math.log1p(data.Income) / 1.4

  // Employment status
  score += data.Employed === 'Yes' ? 3.0 : -1.0
  
  // Years employed
  score += data.YearsEmployed / 1.6

  // Age (normalized, range roughly -1 to +4)
  const ageNorm = (data.Age - 25) / 8
  score += Math.max(-1, Math.min(4, ageNorm))

  // Married
  score += data.Married === 'Yes' ? 0.8 : 0

  // Bank customer
  score += data.BankCustomer === 'Yes' ? 1.5 : 0

  // Driver's license
  score += data.DriversLicense === 'Yes' ? 0.5 : 0

  // Education level - moderate weighting (no longer dominant)
  const eduScores: Record<string, number> = {
    'none': -1.0,
    'high_school': 0.5,
    'bachelors': 1.0,
    'masters': 1.4,
    'phd': 1.8,
  }
  score += eduScores[data.EducationLevel] ?? 0

  // Prior default - MAJOR negative factor
  score += data.PriorDefault === 'Yes' ? -4.0 : 0

  // Debt ratio (normalized to typical debt range)
  score -= data.Debt / 6000

  return score
}

/**
 * Convert raw score to probability using calibrated sigmoid.
 * 
 * sigmoid(x) = 1 / (1 + e^(-k * (x - threshold)))
 * 
 * With threshold=14.0, steepness=0.5:
 * - Score 14.0 → 50% probability
 * - Score 18.0 → ~90% probability  
 * - Score 10.0 → ~12% probability
 * - Score 5.0 → ~5% probability (clamped)
 */
function scoreToProbability(score: number): number {
  const sigmoid = 1 / (1 + Math.exp(-STEEPNESS * (score - THRESHOLD)))
  // Clamp to reasonable range (5% - 95%)
  return Math.max(0.05, Math.min(0.95, sigmoid))
}

/**
 * Main prediction function.
 * Returns approval decision and probability.
 *
 * Mirrors the backend's display adjustments so Demo Mode reads consistently
 * friendlier: approved outcomes are remapped from [0.5, 1.0] onto [0.65, 1.0]
 * (always >= raw), and rejected outcomes get a 20% minimum display floor
 * (capped below 50% so the verdict never flips).
 */
export function predict(input: PredictionInput): PredictionResult {
  const score = calculateScore(input)
  const rawProbability = scoreToProbability(score)

  // Approval threshold at 50% probability
  const approved = rawProbability >= 0.5

  let displayProbability: number
  if (approved && rawProbability >= 0.5) {
    const t = Math.min(1, Math.max(0, (rawProbability - 0.5) / 0.5))
    displayProbability = Math.max(rawProbability, 0.65 + t * 0.35)
  } else {
    // Rejected: believable floor, never crossing into approval territory.
    displayProbability = Math.min(Math.max(rawProbability, 0.2), 0.49)
  }

  return {
    approved,
    probability: Math.round(displayProbability * 100),
    isFallback: true,
    score,
  }
}

/**
 * Test predictions for various scenarios.
 */
export const testScenarios = {
  // Young, unemployed, high debt, prior default → LOW
  worstCase: {
    Age: 22,
    Income: 18000,
    Debt: 25000,
    YearsEmployed: 0,
    Gender: 'Female',
    Married: 'No',
    BankCustomer: 'No',
    EducationLevel: 'none',
    Ethnicity: 'black',
    PriorDefault: 'Yes',
    Employed: 'No',
    DriversLicense: 'No',
    Citizen: 'temporary',
  },
  
  // Average applicant → MID
  average: {
    Age: 35,
    Income: 45000,
    Debt: 8000,
    YearsEmployed: 4,
    Gender: 'Male',
    Married: 'Yes',
    BankCustomer: 'Yes',
    EducationLevel: 'high_school',
    Ethnicity: 'white',
    PriorDefault: 'No',
    Employed: 'Yes',
    DriversLicense: 'Yes',
    Citizen: 'by birth',
  },
  
  // Good profile → HIGH
  goodCase: {
    Age: 40,
    Income: 75000,
    Debt: 5000,
    YearsEmployed: 10,
    Gender: 'Male',
    Married: 'Yes',
    BankCustomer: 'Yes',
    EducationLevel: 'bachelors',
    Ethnicity: 'white',
    PriorDefault: 'No',
    Employed: 'Yes',
    DriversLicense: 'Yes',
    Citizen: 'by birth',
  },
  
  // Great profile → VERY HIGH
  bestCase: {
    Age: 45,
    Income: 120000,
    Debt: 2000,
    YearsEmployed: 15,
    Gender: 'Male',
    Married: 'Yes',
    BankCustomer: 'Yes',
    EducationLevel: 'masters',
    Ethnicity: 'white',
    PriorDefault: 'No',
    Employed: 'Yes',
    DriversLicense: 'Yes',
    Citizen: 'by birth',
  },
}
