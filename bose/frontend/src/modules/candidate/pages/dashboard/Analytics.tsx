import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Download, BarChart3, PieChartIcon, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../../../lib/api';

export default function Analytics() {
    const [credentials, setCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/credentials/my')
            .then(res => {
                setCredentials(res.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch analytics data", err);
                setLoading(false);
            });
    }, []);

    // Calculate Skill Proficiency (by type)
    const typeCounts = credentials.reduce((acc: any, cred: any) => {
        const type = cred.type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(typeCounts).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: typeCounts[key]
    }));

    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    // Calculate Verification Status (by status)
    const statusCounts = credentials.reduce((acc: any, cred: any) => {
        const status = cred.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const barData = Object.keys(statusCounts).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        count: statusCounts[key]
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2 border-purple-200 shadow-xl bg-white overflow-hidden transition-all hover:shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white flex flex-row items-center gap-2 border-b-0 pb-4">
                        <PieChartIcon className="w-6 h-6 text-purple-200" />
                        <CardTitle className="text-xl m-0 font-bold">Credential Types</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 bg-slate-50/50">
                        <div className="h-72 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm p-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            {loading ? (
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                    <p className="text-slate-500 animate-pulse font-medium">Loading analytics...</p>
                                </div>
                            ) : pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={95}
                                            paddingAngle={6}
                                            dataKey="value"
                                            stroke="none"
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none hover:opacity-80 transition-opacity" />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 500 }}
                                            itemStyle={{ color: '#334155' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 500, color: '#475569' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-slate-400">
                                    <BarChart3 className="w-16 h-16 mx-auto mb-3 opacity-30 text-purple-300" />
                                    <p className="font-medium text-slate-500">No credentials uploaded yet</p>
                                    <p className="text-sm mt-1">Upload your first certificate to see stats.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-blue-200 shadow-xl bg-white overflow-hidden transition-all hover:shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white flex flex-row items-center gap-2 border-b-0 pb-4">
                        <Activity className="w-6 h-6 text-blue-200" />
                        <CardTitle className="text-xl m-0 font-bold">Verification Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 bg-slate-50/50">
                        <div className="h-72 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm p-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            {loading ? (
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="text-slate-500 animate-pulse font-medium">Loading analytics...</p>
                                </div>
                            ) : barData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 500}} dy={15} />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <RechartsTooltip 
                                            cursor={{fill: 'rgba(59, 130, 246, 0.05)', radius: 8}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 500 }}
                                        />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60} animationDuration={1500} animationEasing="ease-out">
                                            {barData.map((entry, index) => {
                                                const color = entry.name.toLowerCase() === 'verified' ? '#10b981' : 
                                                              entry.name.toLowerCase() === 'pending' ? '#f59e0b' : 
                                                              entry.name.toLowerCase() === 'rejected' ? '#ef4444' : '#3b82f6';
                                                return <Cell key={`cell-${index}`} fill={color} className="hover:opacity-80 transition-opacity" />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-slate-400">
                                    <Activity className="w-16 h-16 mx-auto mb-3 opacity-30 text-blue-300" />
                                    <p className="font-medium text-slate-500">No credentials to show</p>
                                    <p className="text-sm mt-1">Submit credentials for verification.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 border-slate-200 shadow-md bg-white hover:border-slate-300 transition-colors">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg text-slate-700 font-semibold">Export Statistics</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline" className="border-red-200 hover:bg-red-50 hover:text-red-700 text-red-600 transition-all shadow-sm group font-medium" onClick={() => alert('PDF export functionality would generate a report of these numbers.')}>
                            <Download className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" />
                            Export PDF Report
                        </Button>
                        <Button variant="outline" className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-emerald-600 transition-all shadow-sm group font-medium" onClick={() => alert('CSV export functionality would download raw data.')}>
                            <Download className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" />
                            Export CSV Data
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
