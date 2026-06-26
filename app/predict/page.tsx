import Navbar from '@/components/navbar'
import PredictForm from '@/components/predict-form'

export default function PredictPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Check Your Eligibility</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Fill in the form below and our model will predict your credit card approval outcome.
          </p>
        </div>
        <PredictForm />
      </main>
    </>
  )
}
