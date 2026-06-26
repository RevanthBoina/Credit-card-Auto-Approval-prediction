import Link from 'next/link'
import { ShieldCheck, Zap, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react'
import Navbar from '@/components/navbar'

const features = [
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get your credit card approval prediction in seconds, powered by a trained ML model.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    description: 'Your data is never stored. All predictions are processed in real-time and discarded.',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven',
    description: 'Built on real financial datasets with high accuracy across multiple approval factors.',
  },
]

const steps = [
  'Fill in your financial details on the prediction form.',
  'Our ML model evaluates over 15 applicant features.',
  'Receive an instant Approved or Rejected prediction.',
]

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            ML-Powered Prediction
          </span>
          <h1 className="mt-6 text-balance text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
            Know Your Credit Card
            <br />
            <span className="text-primary">Approval Chances</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Instantly predict whether your credit card application will be approved or rejected using
            our machine learning model trained on real applicant data.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/predict"
              className="flex items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Check My Eligibility <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-border px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              How It Works
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-center text-3xl font-bold text-foreground">Why Use CardApprove AI?</h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
              A fast, reliable, and privacy-first tool for understanding your credit card eligibility.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-background p-6"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold text-foreground">How It Works</h2>
          <div className="mt-12 flex flex-col items-start gap-6 sm:flex-row sm:justify-center">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <h2 className="text-3xl font-bold text-foreground">Ready to find out?</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              It only takes a minute to enter your details and get an instant prediction.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {['No signup required', 'Instant results', '100% free'].map((t) => (
                <span key={t} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {t}
                </span>
              ))}
            </div>
            <Link
              href="/predict"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} CardApprove AI &mdash; Credit Card Auto-Approval Prediction
      </footer>
    </>
  )
}
