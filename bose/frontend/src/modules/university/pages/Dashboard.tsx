
import { Link } from 'react-router-dom';
import { useVerificationRequests } from '../hooks/useUniversityAPI';
import StatCard from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function UniversityDashboard() {
  const { data: requestsData, loading } = useVerificationRequests(1, 5);

  // Calculate stats from all data
  const pendingCount = requestsData?.data?.filter((r: any) => r.status === 'pending').length || 0;
  const verifiedCount = requestsData?.data?.filter((r: any) => r.status === 'approved').length || 0;
  const rejectedCount = requestsData?.data?.filter((r: any) => r.status === 'rejected').length || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 mb-3">
            University Control Center
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            University Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Monitor verification activity and manage issued credentials in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="verification-requests">
            <Button className="shadow-md">
              Review Requests
            </Button>
          </Link>
          <Link to="issue-credential">
            <Button variant="outline">
              Issue New Credential
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Pending Verification"
          value={pendingCount}
          description="Awaiting review"
          icon={Clock}
          trend={pendingCount > 0 ? 'up' : 'down'}
          trendValue={`${pendingCount} requests`}
        />
        <StatCard
          title="Verified Credentials"
          value={verifiedCount}
          description="Successfully approved"
          icon={CheckCircle}
          trend="up"
          trendValue={`${verifiedCount} credentials`}
        />
        <StatCard
          title="Rejected"
          value={rejectedCount}
          description="Needs resubmission"
          icon={AlertCircle}
        />
      </div>

      {/* Recent Verifications */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Recent Verification Requests</CardTitle>
            <CardDescription>Last 5 submissions from your institution</CardDescription>
          </div>
          <Link to="verification-requests">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : requestsData?.data?.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 mb-2">No verification requests yet.</p>
              <p className="text-xs text-slate-400">
                When students submit credentials for verification, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requestsData?.data?.map((req: any) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{req.studentName}</p>
                    <p className="text-sm text-slate-500 truncate">{req.certificateTitle}</p>
                  </div>
                  <div className="flex items-center gap-4 pl-4">
                    <span className="text-sm text-slate-500 whitespace-nowrap">
                      {format(new Date(req.submittedAt), 'MMM dd, yyyy')}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        req.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Quick Actions</h3>
              <p className="text-sm text-blue-800 mt-1">
                Go to <span className="font-semibold">Verification Requests</span> to approve or reject credentials,
                or use <span className="font-semibold">Issue Credential</span> to create new verified records.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}