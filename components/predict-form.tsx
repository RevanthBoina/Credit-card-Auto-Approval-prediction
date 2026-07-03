'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * New 14-field schema for Credit Card Approval Prediction:
 *   Age, Debt, YearsEmployed, CreditScore, Gender, Married, BankCustomer,
 *   EducationLevel, Ethnicity, PriorDefault, Employed, DriversLicense,
 *   Citizen, Income
 */

const boolOptions = ['Yes', 'No']
const genderOptions = ['Male', 'Female']
const educationOptions = [
  { value: 'none', label: 'No Formal Education' },
  { value: 'high_school', label: 'High School' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD / Doctorate' },
]
const ethnicityOptions = [
  { value: 'white', label: 'White' },
  { value: 'black', label: 'Black' },
  { value: 'asian', label: 'Asian' },
  { value: 'latino', label: 'Latino / Hispanic' },
  { value: 'other', label: 'Other' },
]
const citizenOptions = [
  { value: 'by birth', label: 'Citizen by Birth' },
  { value: 'by other means', label: 'Naturalized Citizen' },
  { value: 'temporary', label: 'Temporary Resident' },
]

interface Field {
  name: string
  label: string
  type: 'select' | 'number'
  options?: { value: string; label: string }[]
  simpleOptions?: string[]
  placeholder?: string
  min?: number
  max?: number
  helper?: string
  section: string
  required?: boolean
}

const fields: Field[] = [
  // Personal Information
  {
    section: 'Personal Information', name: 'Age', label: 'Age', type: 'number',
    placeholder: '35', min: 18, max: 100, required: true,
    helper: 'Applicant age in years (18-100).',
  },
  {
    section: 'Personal Information', name: 'Gender', label: 'Gender', type: 'select',
    simpleOptions: genderOptions, required: true,
  },
  {
    section: 'Personal Information', name: 'Married', label: 'Married?', type: 'select',
    simpleOptions: boolOptions, required: true,
    helper: 'Is the applicant currently married?',
  },
  {
    section: 'Personal Information', name: 'Ethnicity', label: 'Ethnicity', type: 'select',
    options: ethnicityOptions, required: true,
  },

  // Financial Information
  {
    section: 'Financial Information', name: 'Income', label: 'Annual Income ($)', type: 'number',
    placeholder: '50000', min: 0, required: true,
    helper: 'Total annual income before taxes in dollars.',
  },
  {
    section: 'Financial Information', name: 'Debt', label: 'Current Debt ($)', type: 'number',
    placeholder: '5000', min: 0, required: true,
    helper: 'Total outstanding debt in dollars.',
  },
  {
    section: 'Financial Information', name: 'CreditScore', label: 'Credit Score', type: 'number',
    placeholder: '650', min: 300, max: 850, required: true,
    helper: 'Current credit score (300-850).',
  },

  // Employment
  {
    section: 'Employment', name: 'Employed', label: 'Currently Employed?', type: 'select',
    simpleOptions: boolOptions, required: true,
  },
  {
    section: 'Employment', name: 'YearsEmployed', label: 'Years Employed', type: 'number',
    placeholder: '5', min: 0, required: true,
    helper: 'Total years at current employer (0 if unemployed).',
  },

  // Banking & History
  {
    section: 'Banking & History', name: 'BankCustomer', label: 'Existing Bank Customer?', type: 'select',
    simpleOptions: boolOptions, required: true,
    helper: 'Does the applicant already have an account with this bank?',
  },
  {
    section: 'Banking & History', name: 'PriorDefault', label: 'Prior Default?', type: 'select',
    simpleOptions: boolOptions, required: true,
    helper: 'Has the applicant ever defaulted on a previous credit obligation?',
  },

  // Documents & Status
  {
    section: 'Documents & Status', name: 'EducationLevel', label: 'Education Level', type: 'select',
    options: educationOptions, required: true,
  },
  {
    section: 'Documents & Status', name: 'DriversLicense', label: 'Has Driver\'s License?', type: 'select',
    simpleOptions: boolOptions, required: true,
  },
  {
    section: 'Documents & Status', name: 'Citizen', label: 'Citizenship Status', type: 'select',
    options: citizenOptions, required: true,
  },
]

const sections = ['Personal Information', 'Financial Information', 'Employment', 'Banking & History', 'Documents & Status']

type FormData = Record<string, string>

/**
 * Backend contract (POST /api/predict -> Flask POST /predict):
 * {
 *   Age, Debt, YearsEmployed, CreditScore, Gender, Married, BankCustomer,
 *   EducationLevel, Ethnicity, PriorDefault, Employed, DriversLicense,
 *   Citizen, Income
 * }
 */
function buildPredictPayload(data: FormData) {
  return {
    Age: Number(data.Age),
    Debt: Number(data.Debt),
    YearsEmployed: Number(data.YearsEmployed),
    CreditScore: Number(data.CreditScore),
    Gender: data.Gender,
    Married: data.Married,
    BankCustomer: data.BankCustomer,
    EducationLevel: data.EducationLevel,
    Ethnicity: data.Ethnicity,
    PriorDefault: data.PriorDefault,
    Employed: data.Employed,
    DriversLicense: data.DriversLicense,
    Citizen: data.Citizen,
    Income: Number(data.Income),
  }
}

interface PredictApiResponse {
  success: boolean
  prediction?: number
  prediction_label?: string
  probability?: number
  error?: string
}

async function runPrediction(data: FormData): Promise<{ approved: boolean; probability: number }> {
  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildPredictPayload(data)),
  })

  const result: PredictApiResponse = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? 'Prediction failed. Please try again.')
  }

  return {
    approved: result.prediction === 1,
    probability: Math.round((result.probability ?? 0) * 100),
  }
}

export default function PredictForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    fields.forEach(({ name, label, type, min, max }) => {
      const val = form[name]
      if (!val || val.trim() === '') {
        newErrors[name] = `${label} is required.`
      } else if (type === 'number') {
        const numVal = Number(val)
        if (isNaN(numVal)) {
          newErrors[name] = `${label} must be a valid number.`
        } else if (min !== undefined && numVal < min) {
          newErrors[name] = `${label} must be at least ${min}.`
        } else if (max !== undefined && numVal > max) {
          newErrors[name] = `${label} must be at most ${max}.`
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleChange(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) {
      const firstError = document.querySelector('[data-field-error]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setLoading(true)
    try {
      const result = await runPrediction(form)
      const params = new URLSearchParams({
        approved: String(result.approved),
        probability: String(result.probability),
      })
      router.push(`/result?${params.toString()}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Prediction failed. Please try again.')
      setLoading(false)
    }
  }

  const inputBase =
    'w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary'

  const errorCount = Object.values(errors).filter(Boolean).length

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Form-level error summary */}
      {errorCount > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Please fix {errorCount} field{errorCount > 1 ? 's' : ''} before submitting.
        </div>
      )}

      {/* Backend/prediction error */}
      {submitError && (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {sections.map((section) => {
        const sectionFields = fields.filter((f) => f.section === section)
        return (
          <div key={section} className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-primary">
              {section}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {sectionFields.map(({ name, label, type, options, simpleOptions, placeholder, min, max, helper, required }) => (
                <div key={name} className="flex flex-col gap-1">
                  <label htmlFor={name} className="flex items-center gap-1 text-sm font-medium text-foreground">
                    {label}
                    {required && <span className="text-destructive" aria-hidden="true">*</span>}
                  </label>
                  {helper && (
                    <p className="text-xs text-muted-foreground">{helper}</p>
                  )}
                  {type === 'select' ? (
                    <select
                      id={name}
                      value={form[name] ?? ''}
                      onChange={(e) => handleChange(name, e.target.value)}
                      aria-invalid={!!errors[name]}
                      aria-describedby={errors[name] ? `${name}-error` : undefined}
                      className={`${inputBase} ${errors[name] ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                    >
                      <option value="">Select...</option>
                      {options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                      {simpleOptions?.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={name}
                      type="number"
                      min={min}
                      max={max}
                      placeholder={placeholder}
                      value={form[name] ?? ''}
                      onChange={(e) => handleChange(name, e.target.value)}
                      aria-invalid={!!errors[name]}
                      aria-describedby={errors[name] ? `${name}-error` : undefined}
                      className={`${inputBase} ${errors[name] ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                    />
                  )}
                  {errors[name] && (
                    <span
                      id={`${name}-error`}
                      role="alert"
                      data-field-error
                      className="text-xs text-destructive"
                    >
                      {errors[name]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <p className="text-xs text-muted-foreground">
        Fields marked <span className="text-destructive font-medium">*</span> are required.
        Input data is not stored after prediction.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing application...
          </>
        ) : (
          'Run Approval Prediction'
        )}
      </button>
    </form>
  )
}
