'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const genderOptions = ['Male', 'Female']
const boolOptions = ['Yes', 'No']
const educationOptions = ['Higher education', 'Secondary / secondary special', 'Incomplete higher', 'Lower secondary', 'Academic degree']
const incomeOptions = ['Working', 'Commercial associate', 'Pensioner', 'State servant', 'Student']
const housingOptions = ['House / apartment', 'With parents', 'Municipal apartment', 'Rented apartment', 'Office apartment', 'Co-op apartment']
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
}

const fields: Field[] = [
  { name: 'gender', label: 'Gender', type: 'select', options: genderOptions },
  { name: 'own_car', label: 'Owns a Car?', type: 'select', options: boolOptions },
  { name: 'own_realty', label: 'Owns Real Estate?', type: 'select', options: boolOptions },
  { name: 'num_children', label: 'Number of Children', type: 'number', placeholder: '0', min: 0 },
  { name: 'annual_income', label: 'Annual Income ($)', type: 'number', placeholder: '50000', min: 0 },
  { name: 'income_type', label: 'Income Type', type: 'select', options: incomeOptions },
  { name: 'education', label: 'Education Level', type: 'select', options: educationOptions },
  { name: 'family_status', label: 'Family Status', type: 'select', options: ['Married', 'Single / not married', 'Civil marriage', 'Separated', 'Widow'] },
  { name: 'housing_type', label: 'Housing Type', type: 'select', options: housingOptions },
  { name: 'age', label: 'Age (years)', type: 'number', placeholder: '35', min: 18 },
  { name: 'employment_years', label: 'Years Employed', type: 'number', placeholder: '5', min: 0 },
  { name: 'mobile', label: 'Has Mobile Phone?', type: 'select', options: boolOptions },
  { name: 'work_phone', label: 'Has Work Phone?', type: 'select', options: boolOptions },
  { name: 'phone', label: 'Has Home Phone?', type: 'select', options: boolOptions },
  { name: 'email', label: 'Has Email?', type: 'select', options: boolOptions },
  { name: 'occupation', label: 'Occupation', type: 'select', options: occupationOptions },
  { name: 'family_members', label: 'Family Members', type: 'number', placeholder: '2', min: 1 },
]

type FormData = Record<string, string>

// Simple rule-based mock prediction (replace with real API call when model is deployed)
function mockPredict(data: FormData): { approved: boolean; probability: number } {
  let score = 0
  const income = parseFloat(data.annual_income) || 0
  const age = parseFloat(data.age) || 0
  const employed = parseFloat(data.employment_years) || 0

  if (income > 80000) score += 3
  else if (income > 40000) score += 2
  else score += 0

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
    fields.forEach(({ name, label, type }) => {
      const val = form[name]
      if (!val || val.trim() === '') {
        newErrors[name] = `${label} is required.`
      } else if (type === 'number' && isNaN(Number(val))) {
        newErrors[name] = `${label} must be a number.`
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
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const result = mockPredict(form)
      const params = new URLSearchParams({
        approved: String(result.approved),
        probability: String(result.probability),
        income: form.annual_income,
      })
      router.push(`/result?${params.toString()}`)
    }, 1200)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map(({ name, label, type, options, placeholder, min }) => (
          <div key={name} className="flex flex-col gap-1.5">
            <label htmlFor={name} className="text-sm font-medium text-foreground">
              {label}
            </label>
            {type === 'select' ? (
              <select
                id={name}
                value={form[name] ?? ''}
                onChange={(e) => handleChange(name, e.target.value)}
                className={`rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary ${
                  errors[name] ? 'border-destructive' : 'border-input'
                }`}
              >
                <option value="">Select…</option>
                {options!.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
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
                className={`rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary ${
                  errors[name] ? 'border-destructive' : 'border-input'
                }`}
              />
            )}
            {errors[name] && (
              <span className="text-xs text-destructive">{errors[name]}</span>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Predicting…
          </>
        ) : (
          'Predict My Approval'
        )}
      </button>
    </form>
  )
}
