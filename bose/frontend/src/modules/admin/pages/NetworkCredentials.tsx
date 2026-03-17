import React, { useState } from 'react';
import { useNetworkCredentials, NetworkCredential } from '../hooks/useNetworkCredentials';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  Shield, 
  Search, 
  Filter, 
  Award, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Ban, 
  ExternalLink,
  Info,
  RefreshCcw,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../lib/api';
import { useToast } from '../../../components/ui/toast';

export default function NetworkCredentials() {
  const [searchTerm, setSearchTerm] = useState("");
  const { 
    credentials, 
    loading, 
    filters, 
    setFilters, 
    revokeCredential,
    refresh
  } = useNetworkCredentials();

  const { toast } = useToast();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revocationReason, setRevocationReason] = useState("");

  const exportCredentials = () => {
    const headers = ["Title", "Student", "Email", "Institution", "Type", "Status", "Issue Date", "Blockchain Tx"];
    const rows = credentials.map(c => [
      c.title,
      c.studentName,
      c.studentEmail || "N/A",
      c.institution,
      c.type,
      c.status,
      format(new Date(c.issueDate), 'yyyy-MM-dd'),
      c.blockchainTxId || "Pending"
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'network_credentials_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm });
  };

  const handleRevoke = async () => {
    if (revokingId && revocationReason) {
      await revokeCredential(revokingId, revocationReason);
      setRevokingId(null);
      setRevocationReason("");
    }
  };

  const handleRetryBlockchain = async (id: string) => {
    try {
      await api.post(`/admin/blockchain/retry/${id}`);
      toast({ title: "Retry Successful", description: "Credential anchored to blockchain.", variant: "success" });
      refresh();
    } catch (error: any) {
      toast({ 
        title: "Retry Failed", 
        description: error.response?.data?.error || "Blockchain connection error.", 
        variant: "error" 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" /> Verified</span>;
      case 'revoked':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="h-3 w-3" /> Revoked</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Info className="h-3 w-3" /> Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Global Credential Audit</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and manage all digital certificates across the network.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportCredentials}
            className="flex items-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
            <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
              {credentials.length} Network Credentials
            </span>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by title, student, or institution..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            <div className="flex gap-2">
              <select 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.type || ""}
                onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
              >
                <option value="">All Types</option>
                <option value="degree">Degree</option>
                <option value="certificate">Certificate</option>
                <option value="diploma">Diploma</option>
              </select>
              <select 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.status || ""}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              >
                <option value="">All Status</option>
                <option value="verified">Verified</option>
                <option value="revoked">Revoked</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credential</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blockchain</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Loading credentials...</td>
                  </tr>
                ) : credentials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No credentials found matching your criteria.</td>
                  </tr>
                ) : (
                  credentials.map((cred) => (
                    <tr key={cred._id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${cred.isPotentialDuplicate ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{cred.title}</span>
                            {cred.isPotentialDuplicate && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" title="Potential duplicate detected" />
                            )}
                          </div>
                          <span className="text-xs text-gray-500 capitalize">{cred.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {cred.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cred.institution}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(cred.issueDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(cred.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        {cred.status !== 'revoked' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setRevokingId(cred._id)}
                          >
                            <Ban className="h-4 w-4 mr-1" /> Revoke
                          </Button>
                        )}
                        {!cred.blockchainTxId && cred.status !== 'revoked' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={() => handleRetryBlockchain(cred._id)}
                          >
                            <RefreshCcw className="h-4 w-4 mr-1" /> Retry Anchor
                          </Button>
                        )}
                        {cred.blockchainTxId && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View on Blockchain">
                            <ExternalLink className="h-4 w-4 text-indigo-600" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Revocation Modal */}
      {revokingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Admin Revocation Override</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              You are about to revoke a credential from the entire system and blockchain. This action is recorded and should only be used for fraudulent data.
            </p>
            <textarea
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all h-32"
              placeholder="Mandatory revocation reason..."
              value={revocationReason}
              onChange={(e) => setRevocationReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => { setRevokingId(null); setRevocationReason(""); }}>Cancel</Button>
              <Button variant="default" className="bg-red-600 hover:bg-red-700" onClick={handleRevoke} disabled={!revocationReason}>
                Confirm Revocation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
