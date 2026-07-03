'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, User, DollarSign, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

const selectOptions: Record<string, string[]> = {
  Gender: ['Male', 'Female'],
  Married: ['Yes', 'No'],
  Employed: ['Yes', 'No'],
  BankCustomer: ['Yes', 'No'],
  PriorDefault: ['Yes', 'No'],
  DriversLicense: ['Yes', 'No'],
  EducationLevel: ['none', 'high_school', 'bachelors', 'masters', 'phd'],
  Ethnicity: ['white', 'black', 'asian', 'latino', 'other'],
  Citizen: ['by birth', 'by other means', 'temporary'],
}

export default function PredictForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sections = [
    {
      title: 'Personal Information',
      icon: User,
      fields: [
        { name: 'Age', label: 'Age', type: 'number', placeholder: '25' },
        { name: 'Gender', label: 'Gender' },
        { name: 'Married', label: 'Married' },
        { name: 'Ethnicity', label: 'Ethnicity' },
      ],
    },
    {
      title: 'Financial Details',
      icon: DollarSign,
      fields: [
        { name: 'Income', label: 'Annual Income ($)', type: 'number', placeholder: '50000' },
        { name: 'Debt', label: 'Current Debt ($)', type: 'number', placeholder: '5000' },
      ],
    },
    {
      title: 'Employment & Background',
      icon: Briefcase,
      fields: [
        { name: 'YearsEmployed', label: 'Years Employed', type: 'number', placeholder: '5' },
        { name: 'Employed', label: 'Currently Employed' },
        { name: 'BankCustomer', label: 'Existing Bank Customer' },
        { name: 'PriorDefault', label: 'Prior Default' },
        { name: 'EducationLevel', label: 'Education Level' },
        { name: 'DriversLicense', label: "Driver's License" },
        { name: 'Citizen', label: 'Citizenship Status' },
      ],
    },
  ]

  function validate() {
    const newErrors: Record<string, string> = {}
    Object.keys(selectOptions).forEach(name => {
      if (!form[name]) newErrors[name] = 'Required'
    })
    ;['Age', 'Income', 'Debt', 'YearsEmployed'].forEach(name => {
      const val = form[name]
      if (!val) newErrors[name] = 'Required'
      else if (isNaN(Number(val))) newErrors[name] = 'Must be a number'
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
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <section.icon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">{section.title}</CardTitle>
              <Badge variant="secondary" className="ml-auto text-xs">
                {section.fields.length} fields
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {section.fields.map(({ name, label, type, placeholder }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    {label}
                  </label>
                  {type === 'number' ? (
                    <Input
                      type="number"
                      placeholder={placeholder}
                      value={form[name] ?? ''}
                      onChange={e => handleChange(name, e.target.value)}
                      className={errors[name] ? 'border-destructive' : ''}
                    />
                  ) : (
                    <select
                      value={form[name] ?? ''}
                      onChange={e => handleChange(name, e.target.value)}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors[name] ? 'border-destructive' : ''
                      }`}
                    >
                      <option value="">Select...</option>
                      {selectOptions[name]?.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  )}
                  {errors[name] && (
                    <p className="text-xs text-destructive">{errors[name]}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Get Prediction'
        )}
      </Button>
    </form>
  )
}
