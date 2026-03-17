import { useAdminSummary } from "../hooks/useAdminSummary";
import OrgTable from "../components/OrgTable";
import AdminActivityFeed from "../components/AdminActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Landmark, Users, Award, Shield, Network, Activity } from "lucide-react";
import { useBlockchainOversight } from "../hooks/useBlockchainOversight";

export default function AdminDashboard() {
  const { data, loading } = useAdminSummary();
  const { health } = useBlockchainOversight();

  const stats = [
    { label: "Total Organizations", value: data?.organizations?.total, icon: Landmark, color: "text-blue-600" },
    { label: "Network Users", value: data?.network?.totalUsers, icon: Users, color: "text-purple-600" },
    { label: "Total Credentials", value: data?.network?.totalCredentials, icon: Award, color: "text-orange-600" },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Control Center</h1>
          <p className="text-gray-500 mt-1">Global management and monitoring of the Bose Network.</p>
        </div>
        
        {/* Quick Blockchain Health */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${health?.status === 'UP' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
          <div className="relative">
            <Network className="h-5 w-5" />
            <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white ${health?.status === 'UP' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
          </div>
          <div className="text-xs font-bold uppercase tracking-wider">
            Blockchain {health?.status || 'OFFLINE'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-md bg-white dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stat.value || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Management Table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Organization Management</h2>
          <Card className="border-none shadow-xl bg-white dark:bg-gray-800/50 overflow-hidden">
            <OrgTable />
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Activity</h2>
          <AdminActivityFeed />
        </div>
      </div>
    </div>
  );
}


