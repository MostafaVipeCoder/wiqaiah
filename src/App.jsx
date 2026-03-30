import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import { Toaster } from 'react-hot-toast'
import './App.css'

// LAZY LOAD PAGES
const LandingPage = lazy(() => import('./pages/LandingPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const WebinarRegistrationPage = lazy(() => import('./pages/WebinarRegistrationPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardLayout = lazy(() => import('./pages/DashboardLayout'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

function App() {
  return (
    <div className="app-container">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--brand-dark)',
            color: 'var(--white)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '12px 24px',
          },
          success: {
            iconTheme: {
              primary: 'var(--brand-primary)',
              secondary: 'var(--white)',
            },
          },
        }}
      />
      <Suspense fallback={<div className="section-padding"><LoadingSpinner /></div>}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<><Navbar /><main><LandingPage /></main><Footer /></>} />
          <Route path="/book" element={<><Navbar /><main><BookingPage /></main><Footer /></>} />
          <Route path="/register/:webinarId" element={<><Navbar /><main><WebinarRegistrationPage /></main><Footer /></>} />
          
          {/* AUTH ROUTES */}
          <Route path="/dashboard/login" element={<LoginPage />} />
          
          {/* PROTECTED DASHBOARD ROUTES */}
          <Route element={<ProtectedRoute />}>
             <Route path="/dashboard/*" element={<DashboardLayout />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
