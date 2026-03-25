import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Shield, User, Landmark, Calendar, Hash, CheckCircle, ExternalLink, Eye, FileText } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { format } from 'date-fns';

interface CredentialDetailsModalProps {
  credential: any;
  onClose: () => void;
}

export default function CredentialDetailsModal({ credential, onClose }: CredentialDetailsModalProps) {
  if (!credential) return null;

  const verificationUrl = `${window.location.origin}/verify/${credential.credentialId || credential._id}`;

  const getBlockchainStatus = () => {
    if (credential.blockchainTxId) {
      return { label: 'Verified on Blockchain', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
    }
    return { label: 'Pending Anchor', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Shield };
  };

  const status = getBlockchainStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Credential Details</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold ${status.color}`}>
                  <status.icon className="h-4 w-4" />
                  {status.label}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {credential.title || credential.credentialName}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={User} label="Student" value={credential.studentName} />
                <InfoItem icon={Landmark} label="Institution" value={credential.institution} />
                <InfoItem icon={Calendar} label="Issue Date" value={format(new Date(credential.issueDate || credential.issuedAt), 'MMMM dd, yyyy')} />
                <InfoItem icon={Hash} label="Credential ID" value={credential.credentialId || credential._id} />
              </div>

              {/* Uploaded Document Review */}
              {(credential.attachments?.length > 0 || credential.fileUrl) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Review Original Document</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Certificate File</p>
                        <p className="text-xs text-gray-500 italic">Review before approval</p>
                      </div>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-500/20"
                      onClick={() => {
                        const fileUrl = credential.fileUrl || credential.attachments[0].url;
                        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                        const serverUrl = baseUrl.replace('/api', '');
                        window.open(`${serverUrl}${fileUrl}`, '_blank');
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View PDF
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Blockchain Evidence</h4>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Credential Hash (SHA-256)</p>
                    <code className="text-xs break-all text-blue-600 dark:text-blue-400 font-mono">
                      {credential.dataHash || credential.credentialHash}
                    </code>
                  </div>
                  {credential.blockchainTxId && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium">Blockchain Transaction ID</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs break-all text-gray-900 dark:text-gray-100 font-mono">
                          {credential.blockchainTxId}
                        </code>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center space-y-6 lg:border-l lg:border-gray-200 lg:dark:border-gray-800 lg:pl-8">
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                <QRCodeSVG value={verificationUrl} size={180} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Scan to Verify</p>
                <p className="text-xs text-gray-500 max-w-[200px]">
                  Share this QR code with employers to instantly verify your credential on the blockchain.
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => window.open(verificationUrl, '_blank')}>
                <ExternalLink className="h-4 w-4" />
                View Verification Page
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <Button onClick={onClose} variant="secondary">Close Details</Button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value || 'N/A'}</p>
      </div>
    </div>
  );
}
