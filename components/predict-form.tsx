'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const genderOptions = ['Male', 'Female']
const boolOptions = ['Yes', 'No']
const educationOptions = [
  'Higher education',
  'Secondary / secondary special',
  'Incomplete higher',
  'Lower secondary',
  'Academic degree',
]
const incomeOptions = ['Working', 'Commercial associate', 'Pensioner', 'State servant', 'Student']
const housingOptions = [
  'House / apartment',
  'With parents',
  'Municipal apartment',
  'Rented apartment',
  'Office apartment',
  'Co-op apartment',
]
const occupationOptions = [
  'Laborers', 'Core staff', 'Accountants', 'Managers', 'Drivers', 'Sales staff',
  'Cleaning staff', 'Cooking staff', 'Private service staff', 'Medicine staff',
  'Security staff', 'High skill tech staff', 'Waiters/barmen staff', 'Low-skill Laborers',
  'Realty agents', 'Secretaries', 'IT staff', 'HR staff',
]

interface Field {
  name: string
  label: string
  type: 'select' | 'number'
  options?: string[]
  placeholder?: string
  min?: number
  helper?: string
  section: string
  required?: boolean
}

const fields: Field[] = [
  // Personal
  {
    section: 'Personal Details', name: 'gender', label: 'Gender', type: 'select',
    options: genderOptions, required: true,
  },
  {
    section: 'Personal Details', name: 'age', label: 'Age', type: 'number',
    placeholder: '35', min: 18, required: true,
    helper: 'Applicant age in years. Must be 18 or older.',
  },
  {
    section: 'Personal Details', name: 'family_status', label: 'Family Status', type: 'select',
    options: ['Married', 'Single / not married', 'Civil marriage', 'Separated', 'Widow'],
    required: true,
  },
  {
    section: 'Personal Details', name: 'num_children', label: 'Number of Children', type: 'number',
    placeholder: '0', min: 0, required: true,
    helper: 'Total number of dependent children.',
  },
  {
    section: 'Personal Details', name: 'family_members', label: 'Family Members', type: 'number',
    placeholder: '2', min: 1, required: true,
    helper: 'Total number of people in the household including the applicant.',
  },
  // Assets
  {
    section: 'Assets', name: 'own_car', label: 'Owns a Car?', type: 'select',
    options: boolOptions, required: true,
    helper: 'Whether the applicant owns a private vehicle.',
  },
  {
    section: 'Assets', name: 'own_realty', label: 'Owns Real Estate?', type: 'select',
    options: boolOptions, required: true,
    helper: 'Whether the applicant owns property or land.',
  },
  {
    section: 'Assets', name: 'housing_type', label: 'Housing Type', type: 'select',
    options: housingOptions, required: true,
  },
  // Employment
  {
    section: 'Employment', name: 'income_type', label: 'Income Type', type: 'select',
    options: incomeOptions, required: true,
    helper: 'Source of the applicant\'s primary income.',
  },
  {
    section: 'Employment', name: 'occupation', label: 'Occupation', type: 'select',
    options: occupationOptions, required: true,
  },
  {
    section: 'Employment', name: 'employment_years', label: 'Years Employed', type: 'number',
    placeholder: '5', min: 0, required: true,
    helper: 'Total years at current or most recent employer. Enter 0 if unemployed.',
  },
  {
    section: 'Employment', name: 'education', label: 'Education Level', type: 'select',
    options: educationOptions, required: true,
  },
  // Financial
  {
    section: 'Financial', name: 'annual_income', label: 'Annual Income (USD)', type: 'number',
    placeholder: '50000', min: 0, required: true,
    helper: 'Total gross annual income before tax, in US dollars.',
  },
  // Contact
  {
    section: 'Contact Details', name: 'mobile', label: 'Has Mobile Phone?', type: 'select',
    options: boolOptions, required: true,
  },
  {
    section: 'Contact Details', name: 'work_phone', label: 'Has Work Phone?', type: 'select',
    options: boolOptions, required: true,
  },
  {
    section: 'Contact Details', name: 'phone', label: 'Has Home Phone?', type: 'select',
    options: boolOptions, required: true,
  },
  {
    section: 'Contact Details', name: 'email', label: 'Has Email Address?', type: 'select',
    options: boolOptions, required: true,
  },
]

const sections = ['Personal Details', 'Assets', 'Employment', 'Financial', 'Contact Details']

type FormData = Record<string, string>

function mockPredict(data: FormData): { approved: boolean; probability: number } {
  let score = 0
  const income = parseFloat(data.annual_income) || 0
  const age = parseFloat(data.age) || 0
  const employed = parseFloat(data.employment_years) || 0

  if (income > 80000) score += 3
  else if (income > 40000) score += 2

  if (age >= 25 && age <= 55) score += 2
  else score += 1

  if (employed >= 3) score += 2
  else if (employed >= 1) score += 1

  if (data.education === 'Higher education' || data.education === 'Academic degree') score += 2
  if (data.own_realty === 'Yes') score += 1
  if (data.own_car === 'Yes') score += 1
  if (data.family_status === 'Married') score += 1

  const maxScore = 12
  const probability = Math.min(Math.round((score / maxScore) * 100), 98)
  return { approved: probability >= 55, probability }
}

export default function PredictForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    fields.forEach(({ name, label, type, min }) => {
      const val = form[name]
      if (!val || val.trim() === '') {
        newErrors[name] = `${label} is required.`
      } else if (type === 'number') {
        if (isNaN(Number(val))) {
          newErrors[name] = `${label} must be a valid number.`
        } else if (min !== undefined && Number(val) < min) {
          newErrors[name] = `${label} must be at least ${min}.`
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      const firstError = document.querySelector('[data-field-error]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setLoading(true)
    setTimeout(() => {
      const result = mockPredict(form)
      const params = new URLSearchParams({
        approved: String(result.approved),
        probability: String(result.probability),
        income: form.annual_income,
      })
      router.push(`/result?${params.toString()}`)
    }, 1400)
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

      {sections.map((section) => {
        const sectionFields = fields.filter((f) => f.section === section)
        return (
          <div key={section} className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-primary">
              {section}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {sectionFields.map(({ name, label, type, options, placeholder, min, helper, required }) => (
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
                      {options!.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={name}
                      type="number"
                      min={min}
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
