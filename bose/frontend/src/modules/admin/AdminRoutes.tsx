import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import NetworkAnalytics from './pages/NetworkAnalytics';
import NetworkCredentials from './pages/NetworkCredentials';
import OrganizationDetailPage from './pages/OrganizationDetailPage';
import UserManagement from './pages/UserManagement';
import BlockchainOversight from './pages/BlockchainOversight';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/analytics" element={<NetworkAnalytics />} />
      <Route path="/credentials" element={<NetworkCredentials />} />
      <Route path="/blockchain" element={<BlockchainOversight />} />
      <Route path="/orgs/:id" element={<OrganizationDetailPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
