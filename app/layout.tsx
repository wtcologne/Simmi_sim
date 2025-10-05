import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Physics Simulations',
  description: 'Interactive physics simulations for educational purposes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
