import React, { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

export default function InstitutionDashboard() {
  const [isSigning, setIsSigning] = useState(false);
  const [queue] = useState<Array<{ id: string; name: string; type: string; status: 'pending' | 'review'; }>>([
    { id: 'REQ-001', name: 'Sarah Chen', type: 'Degree', status: 'pending' },
    { id: 'REQ-002', name: 'Michael Rodriguez', type: 'Certificate', status: 'review' },
  ]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const stats = useMemo(() => ({ issued: 124, avgTimeMins: 16, rejectionRate: 2.3 }), []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Issue Credentials */}
      <section id="issue" className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Issue Credential</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Student ID" aria-label="Student ID" />
              <Input placeholder="Student Name" aria-label="Student Name" />
              <Input placeholder="Course/Program" aria-label="Course" />
              <Input placeholder="Institution" aria-label="Institution" />
              <Input placeholder="Grade" aria-label="Grade" />
              <Input type="date" placeholder="Issue Date" aria-label="Issue Date" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Attach File</label>
              <Input type="file" accept="application/pdf,image/*" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">Preview</Button>
              <Button onClick={() => setIsSigning(true)} disabled={isSigning}>
                {isSigning ? 'Signing…' : 'Digital Sign & Submit'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics (Today)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.issued}</div>
              <div className="text-xs text-gray-500">Issued</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.avgTimeMins}m</div>
              <div className="text-xs text-gray-500">Avg Verify Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.rejectionRate}%</div>
              <div className="text-xs text-gray-500">Rejection Rate</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Verification Queue */}
      <section id="queue">
        <Card>
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">Request ID</th>
                    <th className="py-2 pr-4">Candidate</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {queue.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 pr-4 font-medium">{r.id}</td>
                      <td className="py-3 pr-4">{r.name}</td>
                      <td className="py-3 pr-4">{r.type}</td>
                      <td className="py-3 pr-4 capitalize">{r.status}</td>
                      <td className="py-3 flex gap-2">
                        <Button size="sm" variant="outline">Approve</Button>
                        <Button size="sm" variant="outline">Reject</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Bulk Upload */}
      <section id="bulk" className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bulk Upload (CSV)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input type="file" accept=".csv" aria-label="CSV File" />
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>Validate</Button>
              <Button>Upload & Parse (AI)</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics & Reports</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Button variant="outline">Export CSV</Button>
            <Button variant="outline">Export PDF</Button>
          </CardContent>
        </Card>
      </section>

      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Validation Preview</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600">Validated 100 rows. 2 warnings found. Continue?</div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setBulkDialogOpen(false)}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


