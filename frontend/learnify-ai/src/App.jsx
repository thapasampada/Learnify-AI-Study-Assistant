import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-emerald-50">
          <header className="w-full py-4 px-6 flex items-center justify-between">
            <div className="text-emerald-700 font-bold text-xl">Learnify AI</div>
            <nav className="flex gap-4">
              <Link to="/login" className="text-emerald-700 hover:underline">Login</Link>
              <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">Get Started</Link>
            </nav>
          </header>

          <main>
            <Routes>
              <Route path="/" element={<LandingPage onGetStarted={() => (window.location.href = '/register')} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </main>

          <footer className="text-center py-6 text-sm text-gray-500">© {new Date().getFullYear()} Learnify AI</footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App