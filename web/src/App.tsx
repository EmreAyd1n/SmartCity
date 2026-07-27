import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CreateIssuePage from './pages/CreateIssuePage'
import MainLayout from './components/layout/MainLayout'
import DashboardLayout from './components/common/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Korumalı Rotalar */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            
            {/* Sadece vatandaşların erişebileceği sayfalar */}
            <Route 
              path="create-issue" 
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <CreateIssuePage />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
