import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import FounderRoute from './components/FounderRoute.jsx'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AccountPage from './pages/AccountPage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MyPitchesPage from './pages/MyPitchesPage.jsx'
import PitchDetailPage from './pages/PitchDetailPage.jsx'
import PitchWizardPage from './pages/PitchWizardPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import VerifyEmailPage from './pages/VerifyEmailPage.jsx'
import { useAuthStore } from './store/authStore.js'

export default function App() {
  const status = useAuthStore((state) => state.status)
  const loadSession = useAuthStore((state) => state.loadSession)

  useEffect(() => {
    loadSession()
  }, [loadSession])

  if (status === 'loading') {
    return (
      <p className="min-h-screen bg-[#f3efe6] px-6 py-16 text-sm text-[#1c1915]">
        Checking your session…
      </p>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route
          path="pitches/new"
          element={
            <FounderRoute>
              <PitchWizardPage />
            </FounderRoute>
          }
        />
        <Route
          path="pitches/:id/edit"
          element={
            <FounderRoute>
              <PitchWizardPage />
            </FounderRoute>
          }
        />
        <Route path="pitches/:id" element={<PitchDetailPage />} />
        <Route
          path="my-pitches"
          element={
            <FounderRoute>
              <MyPitchesPage />
            </FounderRoute>
          }
        />
        <Route path="register" element={<RegisterPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
