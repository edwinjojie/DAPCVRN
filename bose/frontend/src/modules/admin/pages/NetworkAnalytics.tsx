import React from 'react';
import { useNetworkAnalytics } from '../hooks/useNetworkAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Award, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

export default function NetworkAnalytics() {
  const { data, loading } = useNetworkAnalytics();

  if (loading) return <div className="p-8 text-center text-gray-500">Loading network analytics...</div>;
  if (!data) return null;

  // Format growth data for charts
  const userGrowthData = data.growth.users.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    users: item.count
  }));

  const credGrowthData = data.growth.credentials.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    issued: item.count
  }));

  // Format distribution data
  const distributionData = data.distribution.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  }));

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Network Intelligence</h1>
        <p className="text-gray-500 mt-1">Real-time data and fraud indicators from across the Bose network.</p>
      </div>

      {/* Fraud & Integrity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-red-600 uppercase flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Fraud Indicator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 dark:text-red-400">
              {data.fraud.rejectionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-red-600/80 mt-1">Verification Rejection Rate</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-orange-600 uppercase flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Suspicious Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
              {data.fraud.suspiciousOrgsCount}
            </div>
            <p className="text-xs text-orange-600/80 mt-1">Orgs with High Rejection Rates</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-green-600 uppercase flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> System Integrity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
              {data.fraud.revocationCount}
            </div>
            <p className="text-xs text-green-600/80 mt-1">Admin Revocation Overrides</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <Card className="border-none shadow-xl bg-white dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> User Acquisition Trend
            </CardTitle>
            <CardDescription>New network participants over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Credential Issuance Chart */}
        <Card className="border-none shadow-xl bg-white dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" /> Credential Issuance
            </CardTitle>
            <CardDescription>Monthly volume of blockchain-anchored certificates.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={credGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Line type="monotone" dataKey="issued" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution Chart */}
        <Card className="border-none shadow-xl bg-white dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="text-lg">Network Composition</CardTitle>
            <CardDescription>Distribution of roles across the ecosystem.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Suspicious Organizations List */}
        <Card className="border-none shadow-xl bg-white dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">High-Risk Organizations</CardTitle>
            <CardDescription>Entities with abnormal verification rejection rates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.fraud.suspiciousOrgsDetails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No suspicious activity detected.</div>
              ) : (
                data.fraud.suspiciousOrgsDetails.map((org, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div>
                      <div className="text-sm font-bold truncate max-w-[200px]">{org._id}</div>
                      <div className="text-xs text-gray-500">{org.total} Total Requests</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-600">{(org.rejectionRate * 100).toFixed(1)}% Rejected</div>
                      <div className="text-xs text-gray-400">Risk Level: High</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
