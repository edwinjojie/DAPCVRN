import { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Download, BarChart3, PieChartIcon, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useToast } from '../../../../components/ui/toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { jsPDF } from 'jspdf';
import api from '../../../../lib/api';

export default function Analytics() {
    const [credentials, setCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();

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

    // ── Export CSV ─────────────────────────────────────────────────────────────
    const handleExportCSV = () => {
        if (credentials.length === 0) {
            toast({ title: 'No Data', description: 'No credentials to export.', variant: 'error' });
            return;
        }

        const headers = ['Name', 'Type', 'Status', 'Institution', 'Issue Date', 'Blockchain TX ID'];
        const rows = credentials.map((cred: any) => [
            `"${(cred.title || cred.credentialName || cred.name || 'Untitled').replace(/"/g, '""')}"`,
            `"${(cred.type || 'Other').replace(/"/g, '""')}"`,
            `"${(cred.status || 'pending').replace(/"/g, '""')}"`,
            `"${(cred.institution || cred.issuer || 'N/A').replace(/"/g, '""')}"`,
            `"${cred.issueDate ? new Date(cred.issueDate).toLocaleDateString() : (cred.issuedOn ? new Date(cred.issuedOn).toLocaleDateString() : 'N/A')}"`,
            `"${(cred.blockchainTxId || 'N/A').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `credentials_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({ title: 'CSV Exported', description: `${credentials.length} credentials exported successfully.`, variant: 'success' });
    };

    // ── Export PDF ─────────────────────────────────────────────────────────────
    const handleExportPDF = () => {
        if (credentials.length === 0) {
            toast({ title: 'No Data', description: 'No credentials to export.', variant: 'error' });
            return;
        }

        const doc = new jsPDF();
        let y = 20;

        // ── Header ────────────────────────────────────────────────────────────
        doc.setFillColor(37, 99, 235); // blue-600
        doc.rect(0, 0, 210, 40, 'F');
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text('BOSE Analytics Report', 105, 18, { align: 'center' });
        doc.setFontSize(11);
        doc.setTextColor(219, 234, 254); // blue-100
        doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 105, 28, { align: 'center' });
        if (user?.name) {
            doc.text(`Student: ${user.name}`, 105, 35, { align: 'center' });
        }
        y = 50;

        // ── Summary Stats ─────────────────────────────────────────────────────
        doc.setTextColor(30, 41, 59); // slate-800
        doc.setFontSize(16);
        doc.text('Summary', 20, y);
        y += 10;

        doc.setFontSize(11);
        doc.setTextColor(71, 85, 105); // slate-600
        doc.text(`Total Credentials: ${credentials.length}`, 25, y); y += 7;
        const verified = credentials.filter((c: any) => c.status === 'verified').length;
        const pending = credentials.filter((c: any) => c.status === 'pending').length;
        const rejected = credentials.filter((c: any) => c.status === 'rejected').length;
        doc.text(`Verified: ${verified}  |  Pending: ${pending}  |  Rejected: ${rejected}`, 25, y); y += 12;

        // ── Credential Type Breakdown ─────────────────────────────────────────
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(16);
        doc.text('Credential Types', 20, y);
        y += 10;

        doc.setFontSize(11);
        doc.setTextColor(71, 85, 105);
        pieData.forEach(item => {
            doc.text(`• ${item.name}: ${item.value}`, 25, y);
            y += 7;
        });
        y += 5;

        // ── Verification Status Breakdown ─────────────────────────────────────
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(16);
        doc.text('Verification Status', 20, y);
        y += 10;

        doc.setFontSize(11);
        doc.setTextColor(71, 85, 105);
        barData.forEach(item => {
            doc.text(`• ${item.name}: ${item.count}`, 25, y);
            y += 7;
        });
        y += 10;

        // ── Credentials Table ─────────────────────────────────────────────────
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(16);
        doc.text('All Credentials', 20, y);
        y += 10;

        // Table header
        doc.setFillColor(241, 245, 249); // slate-100
        doc.rect(15, y - 5, 180, 8, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        doc.text('Name', 18, y);
        doc.text('Type', 85, y);
        doc.text('Status', 115, y);
        doc.text('Institution', 145, y);
        y += 8;

        // Table rows
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        credentials.forEach((cred: any) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            const name = (cred.title || cred.credentialName || cred.name || 'Untitled').substring(0, 35);
            const type = (cred.type || 'Other').substring(0, 15);
            const status = (cred.status || 'pending').substring(0, 12);
            const institution = (cred.institution || cred.issuer || 'N/A').substring(0, 25);

            doc.text(name, 18, y);
            doc.text(type, 85, y);

            // Color-code status
            if (status.toLowerCase() === 'verified') {
                doc.setTextColor(22, 163, 74); // green-600
            } else if (status.toLowerCase() === 'pending') {
                doc.setTextColor(202, 138, 4); // yellow-600
            } else if (status.toLowerCase() === 'rejected') {
                doc.setTextColor(220, 38, 38); // red-600
            }
            doc.text(status, 115, y);
            doc.setTextColor(71, 85, 105); // reset

            doc.text(institution, 145, y);
            y += 7;
        });

        // ── Footer ────────────────────────────────────────────────────────────
        y = 285;
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('Generated by BOSE — Blockchain-Verified Credential Platform', 105, y, { align: 'center' });

        // Save
        const fileName = `${(user?.name || 'Student').replace(/\s+/g, '_')}_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        toast({ title: 'PDF Exported', description: 'Your analytics report has been downloaded.', variant: 'success' });
    };

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
                                            {pieData.map((_entry, index) => (
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
                        <Button variant="outline" className="border-red-200 hover:bg-red-50 hover:text-red-700 text-red-600 transition-all shadow-sm group font-medium" onClick={handleExportPDF}>
                            <Download className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" />
                            Export PDF Report
                        </Button>
                        <Button variant="outline" className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-emerald-600 transition-all shadow-sm group font-medium" onClick={handleExportCSV}>
                            <Download className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" />
                            Export CSV Data
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

