'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function ResultCard() {
  const params = useSearchParams()
  const router = useRouter()

  const approved = params.get('approved') === 'true'
  const probability = Number(params.get('probability') ?? 0)
  const income = params.get('income')

  if (!params.get('approved')) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">No prediction data found.</p>
        <button
          onClick={() => router.push('/predict')}
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Go to Prediction Form
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Badge */}
      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full ${
          approved ? 'bg-[oklch(0.55_0.18_145/0.12)]' : 'bg-destructive/10'
        }`}
      >
        {approved ? (
          <CheckCircle2 className="h-12 w-12 text-[oklch(0.55_0.18_145)]" />
        ) : (
          <XCircle className="h-12 w-12 text-destructive" />
        )}
      </div>

      <div>
        <h1 className="text-4xl font-bold text-foreground">
          {approved ? 'Likely Approved!' : 'Likely Rejected'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {approved
            ? 'Based on the information provided, your application is likely to be approved.'
            : 'Based on the information provided, your application may not meet the criteria.'}
        </p>
      </div>

      {/* Stats */}
      <div className="w-full rounded-xl border border-border bg-card p-6">
        <div className="grid divide-y divide-border">
          <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <span className="text-sm text-muted-foreground">Approval Probability</span>
            <span className={`text-lg font-bold ${approved ? 'text-[oklch(0.55_0.18_145)]' : 'text-destructive'}`}>
              {probability}%
            </span>
          </div>

          {/* Probability bar */}
          <div className="py-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all ${
                  approved ? 'bg-[oklch(0.55_0.18_145)]' : 'bg-destructive'
                }`}
                style={{ width: `${probability}%` }}
              />
            </div>
          </div>

          {income && (
            <div className="flex items-center justify-between py-4 last:pb-0">
              <span className="text-sm text-muted-foreground">Annual Income Provided</span>
              <span className="font-semibold text-foreground">
                ${Number(income).toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-4 last:pb-0">
            <span className="text-sm text-muted-foreground">Verdict</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                approved
                  ? 'bg-[oklch(0.55_0.18_145/0.12)] text-[oklch(0.45_0.18_145)]'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {approved ? 'APPROVED' : 'REJECTED'}
            </span>
          </div>
        </div>
      </div>

      {approved && (
        <p className="max-w-md text-sm text-muted-foreground">
          This is a prediction only and does not constitute a formal credit decision. Contact your
          bank for an official application.
        </p>
      )}

      {!approved && (
        <p className="max-w-md text-sm text-muted-foreground">
          Consider improving your credit profile by increasing your income, building employment
          history, or acquiring assets before reapplying.
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push('/predict')}
          className="flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>
      </div>
    </div>
  )
}
