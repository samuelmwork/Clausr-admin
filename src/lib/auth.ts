import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SESSION_COOKIE = 'clausr_admin_session'

export function getAdminSession() {
  const cookieStore = cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

export function requireAdminAuth() {
  const session = getAdminSession()
  if (!session || session !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/login')
  }
}

export function isValidAdminPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD
}
