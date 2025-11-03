import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import Credentials from './Credentials';
import Analytics from './Analytics';
import Settings from './Settings';
import StudentDashboard from './StudentDashboard';
import EmployerDashboard from './recruiters/EmployerDashboard';

export default function Dashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/employer" element={<EmployerDashboard />} />
      <Route path="/credentials" element={<Credentials />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}