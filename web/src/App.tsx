import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import DashboardLayout from './components/common/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

// Lazy loaded pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const CreateIssuePage = lazy(() => import('./pages/CreateIssuePage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Korumalı Rotalar */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              
              {/* Profil & Ayarlar */}
              <Route path="profile" element={<ProfilePage />} />
              
              {/* Sadece vatandaşların erişebileceği sayfalar */}
              <Route 
                path="create-issue" 
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CreateIssuePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Sadece yetkililerin erişebileceği sayfalar */}
              <Route 
                path="analytics" 
                element={
                  <ProtectedRoute allowedRoles={['official', 'admin']}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
