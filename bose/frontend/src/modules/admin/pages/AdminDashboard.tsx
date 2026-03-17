import { useAdminSummary } from "../hooks/useAdminSummary";
import OrgTable from "../components/OrgTable";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Landmark, Users, Award, Shield } from "lucide-react";

export default function AdminDashboard() {
  const { data, loading } = useAdminSummary();

  const stats = [
    { label: "Total Organizations", value: data?.organizations?.total, icon: Landmark, color: "text-blue-600" },
    { label: "Approved Orgs", value: data?.organizations?.approved, icon: Landmark, color: "text-green-600" },
    { label: "Pending Approval", value: data?.organizations?.pending, icon: Landmark, color: "text-yellow-600" },
    { label: "Network Users", value: data?.network?.totalUsers, icon: Users, color: "text-purple-600" },
    { label: "Total Credentials", value: data?.network?.totalCredentials, icon: Award, color: "text-orange-600" },
    { label: "Total Verifications", value: data?.network?.totalVerifications, icon: Shield, color: "text-indigo-600" },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Network Overview</h1>
        <p className="text-gray-500 mt-1">Global management and monitoring of the Bose Network.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Organization Management</h2>
        <Card className="border-none shadow-xl bg-white dark:bg-gray-800/50 overflow-hidden">
          <OrgTable />
        </Card>
      </div>
    </div>
  );
}


