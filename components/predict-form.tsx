'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Schema: Age, Debt, YearsEmployed, Gender, Married, BankCustomer,
// EducationLevel, Ethnicity, PriorDefault, Employed, DriversLicense, Citizen, Income

type FormData = Record<string, string>

async function runPrediction(data: FormData): Promise<{ approved: boolean; probability: number }> {
  const payload = {
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

  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const result = await response.json()
  if (!result.success) throw new Error(result.error)

  return {
    approved: result.prediction === 1,
    probability: Math.round(result.probability * 100),
  }
}

export default function PredictForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fields = [
    { name: 'Age', label: 'Age', type: 'number', placeholder: '25', required: true },
    { name: 'Gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], required: true },
    { name: 'Married', label: 'Married', type: 'select', options: ['Yes', 'No'], required: true },
    { name: 'Income', label: 'Income ($)', type: 'number', placeholder: '50000', required: true },
    { name: 'Debt', label: 'Debt ($)', type: 'number', placeholder: '5000', required: true },
    { name: 'YearsEmployed', label: 'Years Employed', type: 'number', placeholder: '5', required: true },
    { name: 'Employed', label: 'Employed', type: 'select', options: ['Yes', 'No'], required: true },
    { name: 'BankCustomer', label: 'Bank Customer', type: 'select', options: ['Yes', 'No'], required: true },
    { name: 'PriorDefault', label: 'Prior Default', type: 'select', options: ['Yes', 'No'], required: true },
    { name: 'EducationLevel', label: 'Education', type: 'select', options: ['high_school', 'bachelors', 'masters', 'phd', 'none'], required: true },
    { name: 'Ethnicity', label: 'Ethnicity', type: 'select', options: ['white', 'black', 'asian', 'latino', 'other'], required: true },
    { name: 'DriversLicense', label: 'Driver License', type: 'select', options: ['Yes', 'No'], required: true },
    { name: 'Citizen', label: 'Citizen', type: 'select', options: ['by birth', 'by other means', 'temporary'], required: true },
  ]

  function validate() {
    const newErrors: Record<string, string> = {}
    fields.forEach(({ name, label, type, required }) => {
      const val = form[name]
      if (required && (!val || val.trim() === '')) {
        newErrors[name] = `${label} required`
      } else if (type === 'number' && val && isNaN(Number(val))) {
        newErrors[name] = 'Must be a number'
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleChange(name: string, value: string) {
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!validate()) return
    setLoading(true)
    try {
      const result = await runPrediction(form)
      router.push(`/result?approved=${result.approved}&probability=${result.probability}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold text-center">Credit Card Approval</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {fields.map(({ name, label, type, options, placeholder, required }) => (
          <div key={name} className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === 'select' ? (
              <select
                value={form[name] ?? ''}
                onChange={e => handleChange(name, e.target.value)}
                className={`border rounded px-3 py-2 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select</option>
                {options?.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                placeholder={placeholder}
                value={form[name] ?? ''}
                onChange={e => handleChange(name, e.target.value)}
                className={`border rounded px-3 py-2 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
              />
            )}
            {errors[name] && <span className="text-red-500 text-xs mt-1">{errors[name]}</span>}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Get Prediction'}
      </button>
    </form>
  )
}
