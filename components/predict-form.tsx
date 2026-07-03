'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CreditCard, DollarSign, Briefcase, Building2, User, FileText } from 'lucide-react'

/**
 * New 13-field schema for Credit Card Approval Prediction (NO Credit Score):
 *   Age, Debt, YearsEmployed, Gender, Married, BankCustomer,
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
  },
  {
    section: 'Personal Information', name: 'Gender', label: 'Gender', type: 'select',
    simpleOptions: genderOptions, required: true,
  },
  {
    section: 'Personal Information', name: 'Married', label: 'Married?', type: 'select',
    simpleOptions: boolOptions, required: true,
  },
  {
    section: 'Personal Information', name: 'Ethnicity', label: 'Ethnicity', type: 'select',
    options: ethnicityOptions, required: true,
  },

  // Financial Information
  {
    section: 'Financial Information', name: 'Income', label: 'Annual Income ($)', type: 'number',
    placeholder: '50000', min: 0, required: true,
  },
  {
    section: 'Financial Information', name: 'Debt', label: 'Current Debt ($)', type: 'number',
    placeholder: '5000', min: 0, required: true,
  },

  // Employment
  {
    section: 'Employment', name: 'Employed', label: 'Currently Employed?', type: 'select',
    simpleOptions: boolOptions, required: true,
  },
  {
    section: 'Employment', name: 'YearsEmployed', label: 'Years Employed', type: 'number',
    placeholder: '5', min: 0, required: true,
  },

  // Banking & History
  {
    section: 'Banking & History', name: 'BankCustomer', label: 'Existing Bank Customer?', type: 'select',
    simpleOptions: boolOptions, required: true,
  },
  {
    section: 'Banking & History', name: 'PriorDefault', label: 'Prior Default?', type: 'select',
    simpleOptions: boolOptions, required: true,
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

const sectionIcons: Record<string, React.ReactNode> = {
  'Personal Information': <User className="h-5 w-5" />,
  'Financial Information': <DollarSign className="h-5 w-5" />,
  'Employment': <Briefcase className="h-5 w-5" />,
  'Banking & History': <Building2 className="h-5 w-5" />,
  'Documents & Status': <FileText className="h-5 w-5" />,
}

const sections = ['Personal Information', 'Financial Information', 'Employment', 'Banking & History', 'Documents & Status']

type FormData = Record<string, string>

/**
 * Backend contract (POST /api/predict -> Flask POST /predict):
 * {
 *   Age, Debt, YearsEmployed, Gender, Married, BankCustomer,
 *   EducationLevel, Ethnicity, PriorDefault, Employed, DriversLicense,
 *   Citizen, Income
 * }
 */
function buildPredictPayload(data: FormData) {
  return {
    Age: Number(data.Age),
    Debt: Number(data.Debt),
    YearsEmployed: Number(data.YearsEmployed),
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
    'w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary focus:border-primary'

  const errorCount = Object.values(errors).filter(Boolean).length

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3 pb-4 border-b border-border">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
          <CreditCard className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Check Your Eligibility</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Fill in the form below and our model will predict your credit card approval outcome.
        </p>
      </div>

      {/* Form-level error summary */}
      {errorCount > 0 && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          <span className="font-semibold">Please fix {errorCount} field{errorCount > 1 ? 's' : ''} before submitting.</span>
        </div>
      )}

      {/* Backend/prediction error */}
      {submitError && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {sections.map((section, idx) => {
        const sectionFields = fields.filter((f) => f.section === section)
        return (
          <div key={section} className="relative">
            {/* Section connector line */}
            {idx < sections.length - 1 && (
              <div className="absolute left-6 top-full h-6 w-0.5 bg-border -translate-y-full hidden sm:block" />
            )}
            
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {/* Section Header */}
              <div className="flex items-center gap-3 px-5 py-4 bg-muted/30 border-b border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {sectionIcons[section]}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{section}</h3>
                  <p className="text-xs text-muted-foreground">
                    {sectionFields.length} field{sectionFields.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {/* Section Content */}
              <div className="p-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sectionFields.map(({ name, label, type, options, simpleOptions, placeholder, min, max, required }) => (
                  <div key={name} className="flex flex-col gap-2">
                    <label htmlFor={name} className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {label}
                      {required && <span className="text-primary">*</span>}
                    </label>
                    {type === 'select' ? (
                      <select
                        id={name}
                        value={form[name] ?? ''}
                        onChange={(e) => handleChange(name, e.target.value)}
                        aria-invalid={!!errors[name]}
                        aria-describedby={errors[name] ? `${name}-error` : undefined}
                        className={`${inputBase} ${errors[name] ? 'border-destructive focus:ring-destructive' : 'border-input hover:border-muted-foreground/50'}`}
                      >
                        <option value="">Choose...</option>
                        {options?.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                        {simpleOptions?.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        {placeholder && (
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm">
                            $
                          </span>
                        )}
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
                          className={`${inputBase} ${placeholder ? 'pl-8' : ''} ${errors[name] ? 'border-destructive focus:ring-destructive' : 'border-input hover:border-muted-foreground/50'}`}
                        />
                      </div>
                    )}
                    {errors[name] && (
                      <span
                        id={`${name}-error`}
                        role="alert"
                        data-field-error
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <span className="w-1 h-1 rounded-full bg-destructive" />
                        {errors[name]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      {/* Footer */}
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground text-center">
          Fields marked <span className="text-primary font-medium">*</span> are required.
          Your data is processed securely and not stored.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Processing your application...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Get Approval Prediction
            </>
          )}
        </button>
      </div>
    </form>
  )
}
