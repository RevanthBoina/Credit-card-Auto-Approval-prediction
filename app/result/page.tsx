import { Suspense } from 'react'
import Navbar from '@/components/navbar'
import ResultCard from '@/components/result-card'

export default function ResultPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-20">
        <Suspense fallback={<p className="text-center text-muted-foreground">Loading result…</p>}>
          <ResultCard />
        </Suspense>
      </main>
    </>
  )
}
