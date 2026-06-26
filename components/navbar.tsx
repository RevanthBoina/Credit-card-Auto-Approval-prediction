'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreditCard } from 'lucide-react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/predict', label: 'Check Eligibility' },
  { href: '/about', label: 'About' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="text-lg tracking-tight">CardApprove AI</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
