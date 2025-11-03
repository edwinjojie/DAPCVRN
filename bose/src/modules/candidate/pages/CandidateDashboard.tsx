import { useCandidateSummary } from "../hooks/useCandidateSummary";
import DashboardCard from "../components/DashboardCard";

export default function CandidateDashboard() {
  const { data, loading } = useCandidateSummary();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Candidate Dashboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard label="Verified Credentials" value={data?.verifiedCredentials || 0} />
          <DashboardCard label="Active Applications" value={data?.activeApplications || 0} />
          <DashboardCard label="Unread Messages" value={data?.unreadMessages || 0} />
        </div>
      )}
    </div>
  );
}


