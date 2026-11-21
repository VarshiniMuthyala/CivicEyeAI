import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import RootLayout from './layouts/RootLayout';

// Pages
import LandingPage from './pages/LandingPage';
import ReportIssuePage from './pages/ReportIssuePage';
import CitizenDashboard from './pages/CitizenDashboard';
import TrackComplaintPage from './pages/TrackComplaintPage';
import AdminDashboard from './pages/AdminDashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import PublicDashboard from './pages/PublicDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="report" element={<ReportIssuePage />} />
              <Route path="dashboard" element={<PublicDashboard />} />
              <Route path="track" element={<TrackComplaintPage />} />
              <Route path="citizen" element={<CitizenDashboard />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="department" element={<DepartmentDashboard />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
