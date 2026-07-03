import { Suspense } from 'react'
import Navbar from '@/components/navbar'
import ResultCard from '@/components/result-card'
import { BarChart3 } from 'lucide-react'

export default function ResultPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold sm:text-2xl">Prediction Result</h1>
        </div>
        <Suspense fallback={<p className="text-center text-muted-foreground">Loading...</p>}>
          <ResultCard />
        </Suspense>
      </main>
    </>
  )
}
