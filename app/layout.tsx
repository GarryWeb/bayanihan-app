import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bayanihan — Community Savings Platform',
  description: 'Mula sa notebook at papel, dalhin natin ang bayanihan sa digital age.',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tl">
      <body className="min-h-screen bg-[#F7F7F5] text-[#1A1A18] antialiased">
        {children}
      </body>
    </html>
  )
}
