import { useState } from "react";
import { useOrganizations, Org } from "../hooks/useOrganizations";
import { Button } from "../../../components/ui/button";
import { Eye, CheckCircle, XCircle, AlertCircle, Download, ShieldAlert, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function OrgTable() {
  const { orgs, loading, approveOrg, rejectOrg, suspendOrg, reactivateOrg } = useOrganizations();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const exportOrgs = () => {
    const headers = ["Name", "ID", "Type", "Status", "Members", "Credentials", "Risk"];
    const rows = orgs.map(o => [
      o.name, 
      o.organizationId, 
      o.type, 
      o.status, 
      o.memberCount, 
      o.credentialsCount,
      (o.rejectionRate || 0).toFixed(1) + "%"
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'organizations_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getRiskIndicator = (rate: number = 0) => {
    if (rate > 20) return <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100"><ShieldAlert className="h-3 w-3" /> High Risk</span>;
    if (rate > 5) return <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100"><AlertCircle className="h-3 w-3" /> Moderate Risk</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100"><ShieldCheck className="h-3 w-3" /> Low Risk</span>;
  };

  const handleReject = async () => {
    if (rejectingId && reason) {
      await rejectOrg(rejectingId, reason);
      setRejectingId(null);
      setReason("");
    }
  };

  const getStatusBadge = (status: Org['status']) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3" /> Pending</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="h-3 w-3" /> Rejected</span>;
      case 'suspended':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircle className="h-3 w-3" /> Suspended</span>;
      default:
        return null;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading organizations...</div>;
  if (!orgs || orgs.length === 0) return <div className="p-8 text-center text-gray-500">No organizations found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end px-6 pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportOrgs}
          className="flex items-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Assessment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
            {orgs.map((org) => (
              <tr key={org._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{org.name}</div>
                      <div className="text-xs text-gray-500">{org.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{org.type}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500">
                    <div>{org.memberCount} Members</div>
                    <div>{org.credentialsCount} Issued</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRiskIndicator(org.rejectionRate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(org.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link to={`/dashboard/admin/orgs/${org._id}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>

                  {org.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => approveOrg(org._id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setRejectingId(org._id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {org.status === 'approved' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-gray-600 border-gray-200 hover:bg-gray-50"
                      onClick={() => suspendOrg(org._id)}
                    >
                      Suspend
                    </Button>
                  )}

                  {org.status === 'suspended' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => reactivateOrg(org._id)}
                    >
                      Reactivate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Reject Organization</h3>
            <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting this organization.</p>
            <textarea
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all h-32"
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => { setRejectingId(null); setReason(""); }}>Cancel</Button>
              <Button variant="default" className="bg-red-600 hover:bg-red-700" onClick={handleReject} disabled={!reason}>Reject</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


