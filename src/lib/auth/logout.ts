import { redirect } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { http } from '@/lib/http'

export async function logout(): Promise<void> {
  try {
    await http.post('/auth/logout', null, { silent: true } as object)
  } catch {
    // Fail-safe: clear local state even if API call fails (AC-23)
  } finally {
    useAuthStore.getState().clearUser()
    redirect('/login')
  }
}
