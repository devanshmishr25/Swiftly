import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

// Lazy loaded page components
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Services = lazy(() => import('./pages/Services'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const About = lazy(() => import('./pages/About'))
const Providers = lazy(() => import('./pages/Providers'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const NewJoinings = lazy(() => import('./pages/NewJoinings'))
const ProviderReview = lazy(() => import('./pages/ProviderReview'))

function App() {
  const userData = localStorage.getItem('swiftly_user');
  const user = userData ? JSON.parse(userData) : null;

  return (
    <div className="app-layout">
      <Navbar />
      <ScrollToTop />
      <main className="main-content">
        <Suspense fallback={
          <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
             <div style={{ animation: 'fadeInScale 0.5s infinite alternate', fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Loading Swiftly Data...</div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/providers" element={user?.role === 'provider' ? <Navigate to="/dashboard" /> : <Providers />} />
            <Route path="/services" element={user?.role === 'provider' ? <Navigate to="/dashboard" /> : <Services />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/joinings" element={<NewJoinings />} />
            <Route path="/admin/review/:id" element={<ProviderReview />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
