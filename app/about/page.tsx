import Navbar from '@/components/navbar'
import { Database, BrainCircuit, FlaskConical, Globe } from 'lucide-react'

const stack = [
  { icon: Database, label: 'Dataset', value: 'UCI Credit Card Approval Dataset — 690 applicants, 15 features' },
  { icon: BrainCircuit, label: 'Model', value: 'Logistic Regression with StandardScaler preprocessing' },
  { icon: FlaskConical, label: 'Backend', value: 'Flask (Python) with joblib model serialization' },
  { icon: Globe, label: 'Frontend', value: 'Next.js 16, Tailwind CSS, React' },
]

const featuresList = [
  'Gender', 'Car ownership', 'Real estate ownership', 'Number of children',
  'Annual income', 'Income type', 'Education level', 'Family status',
  'Housing type', 'Age', 'Years employed', 'Contact details',
  'Occupation type', 'Family members',
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">About This Project</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          This application predicts whether a credit card application will be approved or rejected
          using a machine learning model trained on the UCI Credit Card Approval dataset. It
          demonstrates an end-to-end ML pipeline — from data preprocessing and model training to
          serving predictions via a web interface.
        </p>

        <h2 className="mt-10 text-lg font-semibold text-foreground sm:text-xl">Tech Stack</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {stack.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-lg font-semibold text-foreground sm:text-xl">Features Used</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The model considers 15+ applicant attributes including:
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {featuresList.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {f}
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-lg font-semibold text-foreground sm:text-xl">Disclaimer</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Predictions are for educational and demonstration purposes only. They do not constitute
          real financial advice or formal credit decisions. Always consult your financial institution
          for official credit assessments.
        </p>
      </main>
    </>
  )
}
