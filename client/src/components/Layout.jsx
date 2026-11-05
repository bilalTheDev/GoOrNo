import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f3efe6] text-[#1c1915]">
      <Header />
      <Outlet />
    </div>
  )
}
