import React, { useState } from 'react';
import { useIssuedCredentials } from '../hooks/useIssuedCredentials';
import DataTable from '../components/DataTable';
import CredentialDetailsModal from '../components/CredentialDetailsModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { format, subMonths } from 'date-fns';
import { Filter, Eye, Shield, CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react';
import BulkIssueModal from '../components/BulkIssueModal';

export default function IssuedCredentials() {
  const [selectedCredential, setSelectedCredential] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  const { data, loading, refresh } = useIssuedCredentials();

  const handleViewDetails = (credential: any) => {
    setSelectedCredential(credential);
    setShowDetails(true);
  };

  const getBlockchainStatusBadge = (txId: string | null) => {
    if (txId) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm">
          <CheckCircle className="h-3.5 w-3.5" />
          Verified on Blockchain
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
        <Clock className="h-3.5 w-3.5" />
        Pending Anchor
      </span>
    );
  };

  const columns = [
    {
      key: 'studentName',
      label: 'Student Name',
      render: (value: string, row: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{value || row.studentId}</span>
          <span className="text-xs text-gray-500">{row.studentEmail}</span>
        </div>
      )
    },
    {
      key: 'title',
      label: 'Credential',
      render: (value: string, row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 dark:text-gray-200">{value || row.credentialName}</span>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-tighter">
            {row.type || 'Academic'}
          </span>
        </div>
      )
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      render: (value: string) => {
        if (!value) return '—';
        try {
          return format(new Date(value), 'MMM dd, yyyy');
        } catch (e) {
          return '—';
        }
      }
    },
    {
      key: 'blockchainTxId',
      label: 'Blockchain Status',
      render: (value: string) => getBlockchainStatusBadge(value)
    },
    {
      key: 'status',
      label: 'System Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
          value === 'verified' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: '_id',
      label: 'Actions',
      render: (id: string, row: any) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleViewDetails(row)}
          className="gap-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600"
        >
          <Eye className="h-4 w-4" />
          Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Issued Credentials</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track all certificates issued by your institution.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="default" 
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-500/20"
            onClick={() => setShowBulkModal(true)}
          >
            <Upload className="h-4 w-4" />
            Bulk Issue
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              {data?.length || 0} Total Records
            </span>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-blue-500/5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
        <CardHeader>
          <CardTitle>Credential History</CardTitle>
          <CardDescription>All issued records anchored to the distributed ledger.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={data || []} 
            loading={loading}
          />
        </CardContent>
      </Card>

      {showDetails && selectedCredential && (
        <CredentialDetailsModal 
          credential={selectedCredential} 
          onClose={() => setShowDetails(false)} 
        />
      )}

      {showBulkModal && (
        <BulkIssueModal 
          onClose={() => setShowBulkModal(false)} 
          onSuccess={() => {
            refresh();
            setShowBulkModal(false);
          }}
        />
      )}
    </div>
  );
}
