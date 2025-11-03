import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './App.css';
import StudentDashboard from './pages/StudentDashboard';
import EmployerDashboard from './pages/recruiters/EmployerDashboard';
import RecruiterDashboard from './modules/recruiter/RecruiterDashboard';
import RecruiterJobs from './modules/recruiter/pages/Jobs';
import Applicants from './modules/recruiter/pages/Applicants';
import Candidates from './modules/recruiter/pages/Candidates';
import InstitutionDashboard from './pages/InstitutionDashboard';
import Messages from './modules/recruiter/pages/Messages';


function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/student" element={<StudentDashboard />} />
              <Route path="/dashboard/employer" element={
                <ProtectedRoute>
                  <Layout>
                    <RecruiterDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/employer/jobs" element={
                <ProtectedRoute>
                  <Layout>
                    <RecruiterJobs />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/employer/applicants" element={
                <ProtectedRoute>
                  <Layout>
                    <Applicants />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/employer/candidates" element={
                <ProtectedRoute>
                  <Layout>
                    <Candidates />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/employer/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <div className="space-y-6"><h1 className="text-2xl font-bold text-gray-900">Recruiter Analytics</h1><p className="text-sm text-gray-500">Coming soon…</p></div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/employer/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <div className="space-y-6"><h1 className="text-2xl font-bold text-gray-900">Recruiter Settings</h1><p className="text-sm text-gray-500">Coming soon…</p></div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/employer/messages" element={
                <ProtectedRoute>
                  <Layout>
                    <Messages />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/institution" element={<InstitutionDashboard />} />
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;