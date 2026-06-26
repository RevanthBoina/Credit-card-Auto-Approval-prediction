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
      <div className="rounded-xl border border-border bg-card p-8 text-center sm:p-10">
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

  const statusColor = approved ? 'text-[oklch(0.45_0.18_145)]' : 'text-destructive'
  const statusBg = approved ? 'bg-[oklch(0.55_0.18_145/0.12)]' : 'bg-destructive/10'
  const barColor = approved ? 'bg-[oklch(0.55_0.18_145)]' : 'bg-destructive'

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Status icon */}
      <div className={`flex h-20 w-20 items-center justify-center rounded-full ${statusBg}`}>
        {approved ? (
          <CheckCircle2 className="h-10 w-10 text-[oklch(0.55_0.18_145)]" />
        ) : (
          <XCircle className="h-10 w-10 text-destructive" />
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          {approved ? 'Likely Approved!' : 'Likely Rejected'}
        </h1>
        <p className="mt-2 px-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {approved
            ? 'Based on the information provided, your application is likely to be approved.'
            : 'Based on the information provided, your application may not meet the criteria.'}
        </p>
      </div>

      {/* Stats card */}
      <div className="w-full rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="grid divide-y divide-border">
          <div className="flex items-center justify-between py-3 first:pt-0">
            <span className="text-sm text-muted-foreground">Approval Probability</span>
            <span className={`text-lg font-bold ${statusColor}`}>{probability}%</span>
          </div>

          <div className="py-3">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${probability}%` }}
              />
            </div>
          </div>

          {income && (
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Annual Income</span>
              <span className="font-semibold text-foreground">
                ${Number(income).toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-3 last:pb-0">
            <span className="text-sm text-muted-foreground">Verdict</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBg} ${statusColor}`}>
              {approved ? 'APPROVED' : 'REJECTED'}
            </span>
          </div>
        </div>
      </div>

      <p className="max-w-md px-2 text-sm leading-relaxed text-muted-foreground">
        {approved
          ? 'This is a prediction only and does not constitute a formal credit decision. Contact your bank for an official application.'
          : 'Consider improving your credit profile by increasing your income, building employment history, or acquiring assets before reapplying.'}
      </p>

      {/* Actions — stacked on mobile, row on sm+ */}
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <button
          onClick={() => router.push('/predict')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:w-auto sm:py-2.5"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto sm:py-2.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>
      </div>
    </div>
  )
}
