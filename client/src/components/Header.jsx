import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'

export default function Header() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    queryClient.clear()
    navigate('/')
  }

  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
      <Link to="/" className="font-serif text-2xl tracking-tight">
        Go<span className="text-[#0f7a45]">Or</span>No
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <Link to="/account" className="px-2 py-2">
              Account
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[#e4dccf] bg-white px-4 py-2"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-2 py-2">
              Sign in
            </Link>
            <Link
              to="/register?role=founder"
              className="rounded-full bg-[#1c1915] px-4 py-2 text-[#fffdf8]"
            >
              Launch your idea
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
