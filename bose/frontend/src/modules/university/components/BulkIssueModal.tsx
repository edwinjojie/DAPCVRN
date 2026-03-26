import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import * as universityService from '../services/universityService';

interface BulkIssueModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkIssueModal({ onClose, onSuccess }: BulkIssueModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'preview' | 'submitting' | 'complete'>('idle');
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setStatus('parsing');

    // In a real app, use a library like PapaParse or xlsx
    // For this prototype, we'll simulate parsing a CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const parsedData = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        return obj;
      });

      setData(parsedData);
      setStatus('preview');
    };
    reader.readAsText(uploadedFile);
  };

  const handleProcess = async () => {
    setStatus('submitting');
    try {
      // Format data for the backend
      const credentialsToIssue = data.map(item => ({
        studentId: item.studentId || item.id || item.email,
        studentName: item.studentName || item.name,
        studentEmail: item.studentEmail || item.email,
        credentialName: item.credentialName || item.title || 'Bachelor of Science',
        degree: item.degree || item.course || 'Computer Science',
        institution: item.institution || 'Global University',
        issueDate: item.issueDate || new Date().toISOString()
      }));

      const response = await universityService.bulkIssueCredentials(credentialsToIssue);
      setResults(response.results);
      setStatus('complete');
    } catch (err) {
      console.error('Bulk issuance failed:', err);
      setStatus('preview');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border-none">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Bulk Credential Issuance</h2>
              <p className="text-sm text-gray-500">Upload CSV to issue certificates at scale</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/20">
          {status === 'idle' && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800/50 hover:border-blue-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Drop your CSV file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">Required columns: studentId, studentName, studentEmail, degree</p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="mt-6">Select File</Button>
            </div>
          )}

          {status === 'parsing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Parsing your file...</p>
            </div>
          )}

          {status === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Preview: {data.length} records found</h3>
                <Button variant="ghost" size="sm" onClick={() => setStatus('idle')} className="text-blue-600">Change File</Button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">ID</th>
                      <th className="p-3">Degree</th>
                      <th className="p-3">Email</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {data.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="p-3 font-medium">{row.studentName || row.name}</td>
                        <td className="p-3 text-gray-500">{row.studentId || row.id}</td>
                        <td className="p-3 text-gray-500">{row.degree || row.course}</td>
                        <td className="p-3 text-gray-500">{row.studentEmail || row.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 10 && (
                  <div className="p-3 text-center bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                    Showing first 10 records...
                  </div>
                )}
              </div>
            </div>
          )}

          {status === 'submitting' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">Issuing Credentials...</p>
                <p className="text-sm text-gray-500">Anchoring certificates to Hyperledger Fabric blockchain</p>
              </div>
            </div>
          )}

          {status === 'complete' && results && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-800">Process Complete!</h3>
                  <p className="text-green-700">{results.success} credentials issued and anchored successfully.</p>
                </div>
              </div>

              {results.failed > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Failed Records ({results.failed})
                  </h4>
                  <div className="bg-red-50 rounded-xl border border-red-100 p-4 max-h-40 overflow-y-auto">
                    {results.errors.map((err: any, idx: number) => (
                      <div key={idx} className="text-sm text-red-700 py-1 flex justify-between">
                        <span className="font-medium">{err.student}</span>
                        <span>{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 flex justify-end gap-3 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose} disabled={status === 'submitting'}>
            {status === 'complete' ? 'Close' : 'Cancel'}
          </Button>
          {status === 'preview' && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              onClick={handleProcess}
            >
              Issue All Records
            </Button>
          )}
          {status === 'complete' && (
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={onSuccess}
            >
              Done
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}