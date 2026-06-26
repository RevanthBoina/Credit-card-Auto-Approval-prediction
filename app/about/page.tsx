import Navbar from '@/components/navbar'
import { Database, BrainCircuit, FlaskConical, Globe, Target, Workflow, Monitor, Cloud } from 'lucide-react'

const stack = [
  { icon: Database, label: 'Dataset', value: 'UCI Credit Card Approval Dataset — 690 applicants, 15 features' },
  { icon: BrainCircuit, label: 'Model', value: 'Logistic Regression with StandardScaler preprocessing' },
  { icon: FlaskConical, label: 'Backend', value: 'Flask (Python) with joblib model serialisation' },
  { icon: Globe, label: 'Frontend', value: 'Next.js 16, Tailwind CSS, React' },
]

const workflow = [
  { step: '1', title: 'Data Collection', desc: 'The UCI Credit Card Approval dataset is loaded, cleaned, and split into training and test sets.' },
  { step: '2', title: 'Preprocessing', desc: 'Categorical features are label-encoded. Numerical features are standardised using StandardScaler.' },
  { step: '3', title: 'Model Training', desc: 'A Logistic Regression classifier is trained on the processed data and evaluated on held-out test samples.' },
  { step: '4', title: 'Serialisation', desc: 'The trained model and scaler are saved using joblib for deployment with the Flask backend.' },
  { step: '5', title: 'Serving Predictions', desc: 'The Flask API receives applicant features from the frontend, preprocesses them, and returns a prediction with probability.' },
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

        {/* Objective */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">About This Project</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              This is an end-to-end machine learning project that predicts whether a credit card application is likely to be approved or rejected. It was built to demonstrate a complete ML pipeline — from data preprocessing and model training to serving predictions through a web interface. The project is intended for academic and portfolio use, not real-world financial decision-making.
            </p>
          </div>
        </div>

        {/* ML Workflow */}
        <div className="mt-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Workflow className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Machine Learning Workflow</h2>
          </div>
          <div className="mt-5 space-y-3">
            {workflow.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frontend & Backend */}
        <div className="mt-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Frontend & Backend</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The <span className="font-medium text-foreground">frontend</span> is built with Next.js 16 and Tailwind CSS. It collects applicant details via a structured form, validates inputs client-side, and sends them to the backend for prediction.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The <span className="font-medium text-foreground">backend</span> is a Flask (Python) API that loads the serialised model and scaler, preprocesses incoming feature vectors, runs inference, and returns the predicted class and probability score.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Tech Stack</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {stack.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Used */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Features Used by the Model</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The classifier considers the following 14 applicant attributes:
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {featuresList.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Future Work */}
        <div className="mt-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Cloud className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Future Integration</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A planned next step is to integrate <span className="font-medium text-foreground">IBM Watson Machine Learning</span> to host the trained model as a cloud-based endpoint. This would replace the local Flask inference layer with a managed, scalable deployment — enabling REST API calls to IBM Watson AutoAI or a manually deployed pipeline for real-time predictions.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-xl border border-border bg-card px-5 py-5">
          <h2 className="text-sm font-semibold text-foreground">Disclaimer</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            All predictions are for educational and demonstration purposes only. They do not constitute real financial advice or formal credit decisions. Always consult your financial institution for official credit assessments.
          </p>
        </div>
      </main>
    </>
  )
}
