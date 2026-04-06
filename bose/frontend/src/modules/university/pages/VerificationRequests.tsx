import React, { useState } from 'react';
import { useVerificationRequests, useSkillVerificationRequests } from '../hooks/useUniversityAPI';
import { useCredentialActions } from '../hooks/useCredentialActions';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import RejectModal from '../components/RejectModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { format } from 'date-fns';
import { Filter, Eye, Award, Code2 } from 'lucide-react';

export default function VerificationRequests() {
  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'credentials' | 'skills'>('credentials');

  // ── Credential state ───────────────────────────────────────────────────────
  const [credPage, setCredPage] = useState(1);
  const [credStatusFilter, setCredStatusFilter] = useState<string>();
  const [credRefreshTrigger, setCredRefreshTrigger] = useState(0);

  // ── Skill state ────────────────────────────────────────────────────────────
  const [skillPage, setSkillPage] = useState(1);
  const [skillStatusFilter, setSkillStatusFilter] = useState<string>();
  const [skillRefreshTrigger, setSkillRefreshTrigger] = useState(0);

  // ── Shared modal state ─────────────────────────────────────────────────────
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [modalTarget, setModalTarget] = useState<'credential' | 'skill'>('credential');

  // ── Data hooks ─────────────────────────────────────────────────────────────
  const { data: credData, loading: credLoading, error: credError } = useVerificationRequests(credPage, 10, credStatusFilter);
  const { data: skillData, loading: skillLoading, error: skillError } = useSkillVerificationRequests(skillPage, 10, skillStatusFilter, skillRefreshTrigger);
  const {
    approve, reject, loadingApprove, loadingReject,
    approveSkill, rejectSkill, loadingApproveSkill, loadingRejectSkill
  } = useCredentialActions();

  // ── Credential handlers ────────────────────────────────────────────────────
  const handleApprove = async (requestId: string) => {
    setModalTarget('credential');
    setSelectedRequest(credData?.data?.find((r: any) => r._id === requestId));
    setShowApproveModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequest) return;
    if (modalTarget === 'skill') {
      return handleConfirmApproveSkill();
    }
    try {
      await approve(selectedRequest._id, () => {
        setShowApproveModal(false);
        setSelectedRequest(null);
        setCredRefreshTrigger((v) => v + 1);
      });
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleReject = (requestId: string) => {
    setModalTarget('credential');
    setSelectedRequest(credData?.data?.find((r: any) => r._id === requestId));
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!selectedRequest) return;
    if (modalTarget === 'skill') {
      return handleConfirmRejectSkill(reason);
    }
    try {
      await reject(selectedRequest._id, reason, () => {
        setShowRejectModal(false);
        setSelectedRequest(null);
        setCredRefreshTrigger((v) => v + 1);
      });
    } catch (err) {
      // Error handled in hook
    }
  };

  // ── Skill handlers ─────────────────────────────────────────────────────────
  const handleApproveSkill = (requestId: string) => {
    setModalTarget('skill');
    setSelectedRequest(skillData?.data?.find((r: any) => r._id === requestId));
    setShowApproveModal(true);
  };

  const handleConfirmApproveSkill = async () => {
    if (!selectedRequest) return;
    try {
      await approveSkill(selectedRequest._id, () => {
        setShowApproveModal(false);
        setSelectedRequest(null);
        setSkillRefreshTrigger((v) => v + 1);
      });
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleRejectSkill = (requestId: string) => {
    setModalTarget('skill');
    setSelectedRequest(skillData?.data?.find((r: any) => r._id === requestId));
    setShowRejectModal(true);
  };

  const handleConfirmRejectSkill = async (reason: string) => {
    if (!selectedRequest) return;
    try {
      await rejectSkill(selectedRequest._id, reason, () => {
        setShowRejectModal(false);
        setSelectedRequest(null);
        setSkillRefreshTrigger((v) => v + 1);
      });
    } catch (err) {
      // Error handled in hook
    }
  };

  // ── Credential columns ─────────────────────────────────────────────────────
  const credColumns = [
    {
      key: 'studentName',
      label: 'Student Name',
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    {
      key: 'certificateTitle',
      label: 'Certificate',
      render: (value: string) => <span className="text-sm">{value}</span>
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            value === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : value === 'approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: '_id',
      label: 'Actions',
      render: (id: string, row: any) => (
        <div className="flex gap-2">
          {row.fileUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                const serverUrl = baseUrl.replace('/api', '');
                window.open(`${serverUrl}${row.fileUrl}`, '_blank');
              }}
              title="View Certificate"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApprove(id)}
            disabled={row.status !== 'pending' || loadingApprove === id}
          >
            {loadingApprove === id ? 'Approving...' : 'Approve'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleReject(id)}
            disabled={row.status !== 'pending' || loadingReject === id}
          >
            {loadingReject === id ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      )
    }
  ];

  // ── Skill columns ──────────────────────────────────────────────────────────
  const skillColumns = [
    {
      key: 'studentName',
      label: 'Student Name',
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    {
      key: 'skillName',
      label: 'Skill Name',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => <span className="text-sm text-slate-600">{value || '—'}</span>
    },
    {
      key: 'level',
      label: 'Level',
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Expert': 'bg-amber-100 text-amber-800',
          'Advanced': 'bg-blue-100 text-blue-800',
          'Intermediate': 'bg-emerald-100 text-emerald-800',
          'Beginner': 'bg-slate-100 text-slate-700',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors[value] || 'bg-slate-100 text-slate-600'}`}>
            {value || '—'}
          </span>
        );
      }
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            value === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : value === 'approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: '_id',
      label: 'Actions',
      render: (id: string, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApproveSkill(id)}
            disabled={row.status !== 'pending' || loadingApproveSkill === id}
          >
            {loadingApproveSkill === id ? 'Approving...' : 'Approve'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleRejectSkill(id)}
            disabled={row.status !== 'pending' || loadingRejectSkill === id}
          >
            {loadingRejectSkill === id ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      )
    }
  ];

  // ── Shared filter UI builder ───────────────────────────────────────────────
  const renderFilters = (
    currentFilter: string | undefined,
    setFilter: (v: string | undefined) => void,
    setPage: (v: number) => void
  ) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="font-medium text-gray-900">Filter by Status</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'All', value: undefined },
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ].map(({ label, value }) => (
            <Button
              key={label}
              variant={currentFilter === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setFilter(value); setPage(1); }}
            >
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const isApproveLoading = modalTarget === 'skill' ? loadingApproveSkill === selectedRequest?._id : loadingApprove === selectedRequest?._id;
  const isRejectLoading = modalTarget === 'skill' ? loadingRejectSkill === selectedRequest?._id : loadingReject === selectedRequest?._id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
        <p className="text-gray-500 mt-1">Review and approve or reject credential and skill submissions</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 rounded-xl p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'credentials'
              ? 'bg-white text-blue-700 shadow-md shadow-blue-100'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          Credentials
          {credData?.pagination?.total > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
              {credData.pagination.total}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'skills'
              ? 'bg-white text-emerald-700 shadow-md shadow-emerald-100'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Skills
          {skillData?.pagination?.total > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">
              {skillData.pagination.total}
            </span>
          )}
        </button>
      </div>

      {/* ── Credentials Tab ─────────────────────────────────────────────── */}
      {activeTab === 'credentials' && (
        <>
          {renderFilters(credStatusFilter, setCredStatusFilter, setCredPage)}
          <DataTable
            columns={credColumns}
            data={credData?.data || []}
            loading={credLoading}
            error={credError}
            pagination={{
              page: credPage,
              limit: 10,
              total: credData?.pagination?.total
            }}
            onPageChange={setCredPage}
          />
        </>
      )}

      {/* ── Skills Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'skills' && (
        <>
          {renderFilters(skillStatusFilter, setSkillStatusFilter, setSkillPage)}
          <DataTable
            columns={skillColumns}
            data={skillData?.data || []}
            loading={skillLoading}
            error={skillError}
            pagination={{
              page: skillPage,
              limit: 10,
              total: skillData?.pagination?.total
            }}
            onPageChange={setSkillPage}
          />
        </>
      )}

      {/* Modals (shared) */}
      <ConfirmModal
        open={showApproveModal}
        title={modalTarget === 'skill' ? 'Approve Skill Verification' : 'Approve Credential'}
        description={
          modalTarget === 'skill'
            ? `Are you sure you want to verify the skill "${selectedRequest?.skillName}" for ${selectedRequest?.studentName}?`
            : `Are you sure you want to approve the credential for ${selectedRequest?.studentName}? This action will generate a verification hash.`
        }
        confirmText="Approve"
        loading={isApproveLoading}
        onConfirm={handleConfirmApprove}
        onCancel={() => {
          setShowApproveModal(false);
          setSelectedRequest(null);
        }}
      />

      <RejectModal
        open={showRejectModal}
        studentName={selectedRequest?.studentName}
        loading={isRejectLoading}
        onReject={handleConfirmReject}
        onCancel={() => {
          setShowRejectModal(false);
          setSelectedRequest(null);
        }}
      />
    </div>
  );
}
