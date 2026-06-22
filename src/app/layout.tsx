import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Points Mall',
  description: 'Employee Points Mall',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
