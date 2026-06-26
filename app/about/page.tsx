import Navbar from '@/components/navbar'
import { Database, BrainCircuit, FlaskConical, Globe } from 'lucide-react'

const stack = [
  { icon: Database, label: 'Dataset', value: 'UCI Credit Card Approval Dataset — 690 applicants, 15 features' },
  { icon: BrainCircuit, label: 'Model', value: 'Logistic Regression with StandardScaler preprocessing' },
  { icon: FlaskConical, label: 'Backend', value: 'Flask (Python) with joblib model serialization' },
  { icon: Globe, label: 'Frontend', value: 'Next.js 16, Tailwind CSS, React' },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="text-3xl font-bold text-foreground">About This Project</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          This application predicts whether a credit card application will be approved or rejected
          using a machine learning model trained on the UCI Credit Card Approval dataset. It
          demonstrates an end-to-end ML pipeline — from data preprocessing and model training to
          serving predictions via a web interface.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-foreground">Tech Stack</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {stack.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-semibold text-foreground">Features Used</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The model considers 15+ applicant attributes including:
        </p>
        <ul className="mt-4 grid list-inside list-disc gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
          {[
            'Gender', 'Car ownership', 'Real estate ownership', 'Number of children',
            'Annual income', 'Income type', 'Education level', 'Family status',
            'Housing type', 'Age', 'Years employed', 'Contact details',
            'Occupation type', 'Family members',
          ].map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-foreground">Disclaimer</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Predictions are for educational and demonstration purposes only. They do not constitute
          real financial advice or formal credit decisions. Always consult your financial institution
          for official credit assessments.
        </p>
      </main>
    </>
  )
}
