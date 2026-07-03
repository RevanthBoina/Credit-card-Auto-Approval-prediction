'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function ResultCard() {
  const params = useSearchParams()
  const router = useRouter()
  const [animated, setAnimated] = useState(false)

  const approved = params.get('approved') === 'true'
  const probability = Number(params.get('probability') ?? 0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!params.get('approved')) {
    return (
      <Card className="p-8 text-center sm:p-10">
        <p className="text-sm text-muted-foreground">No prediction data found.</p>
        <Button onClick={() => router.push('/predict')} className="mt-6">
          Go to Prediction Form
        </Button>
      </Card>
    )
  }

  const statusColor = approved ? 'text-green-600' : 'text-destructive'
  const statusBg = approved ? 'bg-green-100' : 'bg-destructive/10'
  const barColor = approved ? 'bg-green-500' : 'bg-destructive'

  return (
    <div className={`space-y-6 transition-all duration-500 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* Status icon */}
      <div className="flex justify-center">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full ${statusBg} transition-transform duration-300 ${animated ? 'scale-100' : 'scale-50'}`}>
          {approved ? (
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          ) : (
            <XCircle className="h-10 w-10 text-destructive" />
          )}
        </div>
      </div>

      {/* Verdict */}
      <div className="text-center">
        <h1 className={`text-3xl font-bold ${statusColor}`}>
          {approved ? '✅ Likely Approved' : '❌ Likely Rejected'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {approved
            ? 'Based on the entered details, this application would likely be approved.'
            : 'Based on the entered details, this application may not meet approval criteria.'}
        </p>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-5xl font-bold">{probability}%</span>
              <p className="text-sm text-muted-foreground">Confidence Score</p>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approval Probability</span>
                <span className="font-medium">{probability}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                  style={{ width: animated ? `${probability}%` : '0%' }}
                />
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${statusBg} ${statusColor}`}>
                {approved ? 'APPROVED' : 'REJECTED'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        This is for educational purposes only. Not a real credit decision.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={() => router.push('/predict')} className="flex-1 gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
        <Button onClick={() => router.push('/')} className="flex-1 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
      </div>
    </div>
  )
}
