import Navbar from '@/components/navbar'
import PredictForm from '@/components/predict-form'

export default function PredictPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <PredictForm />
      </main>
    </>
  )
}
