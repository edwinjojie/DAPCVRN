//import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { ToastProvider } from './components/ui/toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './App.css';
import StudentDashboard from './pages/StudentDashboard';
//import EmployerDashboard from './pages/recruiters/EmployerDashboard';
import RecruiterDashboard from './modules/recruiter/RecruiterDashboard';
import RecruiterJobs from './modules/recruiter/pages/Jobs';
import Applicants from './modules/recruiter/pages/Applicants';
import Candidates from './modules/recruiter/pages/Candidates';
import AdminDashboard from './modules/admin/pages/AdminDashboard';
<<<<<<< Updated upstream
import UniversityDashboard from './modules/university/UniversityDashboard';
=======
import InstitutionDashboard from './modules/institution/pages/InstitutionDashboard';
import Verifications from './modules/institution/pages/Verifications';
import IssuedCredentials from './modules/institution/pages/IssuedCredentials';
import BulkUpload from './modules/institution/pages/BulkUpload';
import InstitutionAnalytics from './modules/institution/pages/Analytics';
>>>>>>> Stashed changes
import Messages from './modules/recruiter/pages/Messages';
import RedirectToRoleDashboard from './routes/RedirectToRoleDashboard';
import Unauthorized from './pages/Unauthorized';


function App() {
  return (
    <Router>
      <DarkModeProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
              <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/student" element={
                <ProtectedRoute roles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/recruiter" element={
                <ProtectedRoute roles={["recruiter"]}>
                  <Layout>
                    <RecruiterDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/recruiter/jobs" element={
                <ProtectedRoute roles={["recruiter"]}>
                  <Layout>
                    <RecruiterJobs />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/recruiter/applicants" element={
                <ProtectedRoute roles={["recruiter"]}>
                  <Layout>
                    <Applicants />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/recruiter/candidates" element={
                <ProtectedRoute roles={["recruiter"]}>
                  <Layout>
                    <Candidates />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/recruiter/analytics" element={
                <ProtectedRoute roles={["recruiter"]}>
                  <Layout>
                    <div className="space-y-6"><h1 className="text-2xl font-bold text-gray-900">Recruiter Analytics</h1><p className="text-sm text-gray-500">Coming soon…</p></div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/recruiter/settings" element={
                <ProtectedRoute roles={["recruiter"]}>
                  <Layout>
                    <div className="space-y-6"><h1 className="text-2xl font-bold text-gray-900">Recruiter Settings</h1><p className="text-sm text-gray-500">Coming soon…</p></div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/recruiter/messages" element={
                <ProtectedRoute roles={["recruiter"]}>
                  <Layout>
                    <Messages />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin" element={
                <ProtectedRoute roles={["admin"]}>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
<<<<<<< Updated upstream
              <Route path="/university/*" element={
                <ProtectedRoute roles={["university", "institution", "verifier", "issuer"]}>
=======
              <Route path="/dashboard/university" element={
                <ProtectedRoute roles={["university"]}>
>>>>>>> Stashed changes
                  <Layout>
                    <UniversityDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/university/verifications" element={
                <ProtectedRoute roles={["university"]}>
                  <Layout>
                    <Verifications />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/university/issued" element={
                <ProtectedRoute roles={["university"]}>
                  <Layout>
                    <IssuedCredentials />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/university/bulk" element={
                <ProtectedRoute roles={["university"]}>
                  <Layout>
                    <BulkUpload />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/university/analytics" element={
                <ProtectedRoute roles={["university"]}>
                  <Layout>
                    <InstitutionAnalytics />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={<RedirectToRoleDashboard />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              </Routes>
            </div>
          </ToastProvider>
        </AuthProvider>
      </DarkModeProvider>
    </Router>
  );
}

export default App;