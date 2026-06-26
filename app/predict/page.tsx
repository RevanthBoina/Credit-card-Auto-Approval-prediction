import Navbar from '@/components/navbar'
import PredictForm from '@/components/predict-form'

export default function PredictPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Check Your Eligibility</h1>
          <p className="mt-2 text-muted-foreground">
            Fill in the form below and our model will predict your credit card approval outcome.
          </p>
        </div>
        <PredictForm />
      </main>
    </>
  )
}
