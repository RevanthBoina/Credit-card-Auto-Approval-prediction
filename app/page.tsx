import Link from 'next/link'
import { ShieldCheck, Zap, BarChart3, ArrowRight, CheckCircle2, BrainCircuit } from 'lucide-react'
import Navbar from '@/components/navbar'

const features = [
  {
    icon: Zap,
    title: 'Fast Prediction',
    description: 'Enter applicant details and receive a model-based prediction in under a second.',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Model',
    description: 'Built on the UCI Credit Card Approval dataset using logistic regression with standardised features.',
  },
  {
    icon: ShieldCheck,
    title: 'Simple Eligibility Check',
    description: 'A straightforward interface designed for research and project demonstration — no sign-up needed.',
  },
]

const steps = [
  {
    title: 'Enter Applicant Details',
    desc: 'Fill in personal, financial, and employment information across structured form sections.',
  },
  {
    title: 'Model Processes the Input',
    desc: 'The trained ML model evaluates over 15 features and computes an approval probability score.',
  },
  {
    title: 'View Approval Prediction',
    desc: 'A clear result is displayed — Approved or Rejected — with a model confidence percentage.',
  },
]

const modelOverview = [
  { label: 'Problem Type', value: 'Binary classification (Approved / Rejected)' },
  { label: 'Features Used', value: 'Applicant financial and demographic attributes' },
  { label: 'Purpose', value: 'Approval prediction research and project demonstration' },
]

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            Machine Learning Project
          </span>
          <h1 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Credit Card Approval
            <br className="hidden sm:block" />
            <span className="text-primary"> Prediction System</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Enter applicant information and let a trained machine learning model estimate the likelihood of credit card approval. This tool is built for educational and project demonstration purposes.
          </p>
          <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/predict"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Check Eligibility <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="flex items-center justify-center rounded-lg border border-border px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              About This Project
            </Link>
          </div>

          {/* Disclaimer */}
          <div className="mx-auto mt-8 max-w-xl rounded-lg border border-border bg-card px-5 py-4 text-left">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Disclaimer:</span> This prediction is based on a trained machine learning model and is for educational/demo purposes only. It does not guarantee final approval by any bank.
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Privacy:</span> Input data is used only for prediction and is not permanently stored.
            </p>
          </div>
        </section>

        {/* Why Use */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
            <h2 className="text-center text-xl font-bold text-foreground sm:text-2xl">
              Why Use This Tool?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">
              A simple, reliable way to explore ML-based credit card approval prediction.
            </p>
            <div className="mt-9 grid gap-5 sm:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-background p-5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-1.5 font-semibold text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
          <h2 className="text-center text-xl font-bold text-foreground sm:text-2xl">How It Works</h2>
          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Model Overview */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-18">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <BrainCircuit className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">Model Overview</h2>
            </div>
            <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-background">
              {modelOverview.map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <span className="text-sm text-muted-foreground sm:text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-18">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">Ready to run a prediction?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Fill in the applicant details form and get an instant model-based result.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            {['No sign-up required', 'Instant result', 'For demo use only'].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" /> {t}
              </span>
            ))}
          </div>
          <Link
            href="/predict"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start Prediction <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Credit Card Approval Prediction System &mdash; Educational ML Project
      </footer>
    </>
  )
}
