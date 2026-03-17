import React, { useState } from 'react';
import { useBlockchainOversight } from '../hooks/useBlockchainOversight';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  Activity, 
  Database, 
  Cpu, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCcw, 
  Search, 
  ShieldCheck, 
  Server,
  Network,
  Clock,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

export default function BlockchainOversight() {
  const { health, transactions, loading, verifyManual, refresh } = useBlockchainOversight();
  const [manualId, setManualId] = useState("");

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId) {
      await verifyManual(manualId);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Blockchain Oversight</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time health monitoring and transaction auditing of the Hyperledger Fabric network.</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Network Status & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className={`border-none shadow-lg ${health?.status === 'UP' ? 'bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500' : 'bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase flex items-center gap-2">
              <Network className="h-4 w-4" /> Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${health?.status === 'UP' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {health?.status || 'Unknown'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Hyperledger Fabric Network</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-600 uppercase flex items-center gap-2">
              <Activity className="h-4 w-4" /> Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {health?.latency || '0ms'}
            </div>
            <p className="text-xs text-blue-600/80 mt-1">Average Response Time</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-indigo-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-indigo-600 uppercase flex items-center gap-2">
              <Database className="h-4 w-4" /> Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
              {health?.metrics?.totalTransactions || 0}
            </div>
            <p className="text-xs text-indigo-600/80 mt-1">Total Certificates Anchored</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-purple-600 uppercase flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {health?.metrics?.successRate || '100%'}
            </div>
            <p className="text-xs text-purple-600/80 mt-1">Network Reliability</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Monitor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-white dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-500" /> Transaction Monitor
              </CardTitle>
              <CardDescription>Live feed of recent blockchain anchor transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TX ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credential</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-500">No recent transactions.</td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <code className="text-xs text-blue-600 font-mono truncate max-w-[120px]">
                                {tx.blockchainTxId}
                              </code>
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-semibold">{tx.title}</div>
                            <div className="text-xs text-gray-500">{tx.institution}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="h-3 w-3" /> SUCCESS
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                            {format(new Date(tx.updatedAt), 'HH:mm:ss')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Oversight Tools */}
        <div className="space-y-6">
          {/* Peer Nodes Status */}
          <Card className="border-none shadow-xl bg-white dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5 text-indigo-500" /> Peer Nodes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {health?.peers.map((peer, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <Server className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-xs font-bold">{peer.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-semibold">{peer.role}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${peer.status === 'Running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {peer.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Manual Verification Tool */}
          <Card className="border-none shadow-xl bg-white dark:bg-gray-800/50 border-t-4 border-blue-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-500" /> Manual Verify
              </CardTitle>
              <CardDescription>Cross-check any ID against the blockchain ledger.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualVerify} className="space-y-4">
                <Input 
                  placeholder="Enter Credential ID..." 
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border-gray-200"
                />
                <Button type="submit" className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4" />
                  Query Ledger
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
