/**
 * Client-side prediction engine for Credit Card Approval.
 * 
 * This replicates the logic from the Flask backend's training model.
 * Used as fallback when backend is unavailable.
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

/**
 * Calculate approval score based on the same logic as the Flask training model.
 * Higher score = more likely to be approved.
 */
function calculateScore(data: PredictionInput): number {
  let score = 0

  // Income contribution (most important) - log scale
  score += Math.log1p(data.Income) / 2

  // Employment status (+2.5 for employed)
  score += data.Employed === 'Yes' ? 2.5 : 0
  
  // Years employed
  score += data.YearsEmployed / 2

  // Age (mature applicants more stable, clip between -1 and +4)
  const ageScore = (data.Age - 25) / 8
  score += Math.max(-1, Math.min(4, ageScore))

  // Married (+0.8)
  score += data.Married === 'Yes' ? 0.8 : 0

  // Bank customer (+1.5)
  score += data.BankCustomer === 'Yes' ? 1.5 : 0

  // Driver's license (+0.5)
  score += data.DriversLicense === 'Yes' ? 0.5 : 0

  // Education level
  const eduScores: Record<string, number> = {
    'none': -0.5,
    'high_school': 0.5,
    'bachelors': 1.5,
    'masters': 2.0,
    'phd': 2.5,
  }
  score += eduScores[data.EducationLevel] ?? 0

  // Prior default (-4.0) - major negative factor
  score += data.PriorDefault === 'Yes' ? -4.0 : 0

  // Debt (-debt/5000)
  score -= data.Debt / 5000

  return score
}

/**
 * Convert score to probability using sigmoid function.
 */
function scoreToProbability(score: number): number {
  // Sigmoid function: 1 / (1 + e^(-score))
  // Shift score by threshold (~5) to get meaningful probabilities
  const shiftedScore = score - 5
  return 1 / (1 + Math.exp(-shiftedScore))
}

/**
 * Main prediction function.
 * Returns approval decision and probability.
 */
export function predict(input: PredictionInput): PredictionResult {
  const score = calculateScore(input)
  const probability = Math.max(0.05, Math.min(0.99, scoreToProbability(score)))
  
  // Approval threshold at 50% probability
  const approved = probability >= 0.5

  return {
    approved,
    probability: Math.round(probability * 100),
    isFallback: true,
    score,
  }
}

/**
 * Example applicants for testing:
 */
export const examples = {
  highChance: {
    Age: 35,
    Income: 75000,
    Debt: 5000,
    YearsEmployed: 8,
    Gender: 'Male',
    Married: 'Yes',
    BankCustomer: 'Yes',
    EducationLevel: 'bachelors',
    Ethnicity: 'white',
    PriorDefault: 'No',
    Employed: 'Yes',
    DriversLicense: 'Yes',
    Citizen: 'by birth',
  } as PredictionInput,
  
  lowChance: {
    Age: 22,
    Income: 18000,
    Debt: 20000,
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
  } as PredictionInput,
}
