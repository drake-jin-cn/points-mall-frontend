'use client'

import { Toaster } from 'sonner'
import { LoadingOverlay } from './LoadingOverlay'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LoadingOverlay />
      <Toaster position="top-right" richColors />
    </>
  )
}
