import Navbar from '@/components/navbar'
import PredictForm from '@/components/predict-form'
import { CreditCard } from 'lucide-react'

export default function PredictPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <CreditCard className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">Credit Card Approval</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your details to check eligibility
          </p>
        </div>
        <PredictForm />
      </main>
    </>
  )
}
