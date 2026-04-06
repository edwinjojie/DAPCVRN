import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/ui/toast';
import api from '../../../lib/api';
import { jsPDF } from 'jspdf';

// Layout and Types
import StudentLayout from './dashboard/StudentLayout';
import { DashboardSection, CertificateItem, SkillBadge, JobHistory } from './dashboard/types';

// Page Components
import DashboardHome from './dashboard/DashboardHome';
import UploadCredits from './dashboard/UploadCredits';
import Portfolio from './dashboard/Portfolio';
import ShareCredentials from './dashboard/ShareCredentials';
import Recommendations from './dashboard/Recommendations';
import Analytics from './dashboard/Analytics';
import CertificateDetailsModal from './dashboard/CertificateDetailsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import QRCodeModal from '../components/QRCodeModal';

import { Share2, QrCode } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [skillBadges, setSkillBadges] = useState<SkillBadge[]>([]);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);

  // Modals state
  const [certificateDetailsOpen, setCertificateDetailsOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const studentProfile = useMemo(() => ({
    name: user?.name || 'Student Name',
    role: user?.role || 'Student',
    email: user?.email || 'student@example.com',
  }), [user]);

  useEffect(() => {
    // Load existing credentials
    const fetchCredentials = async () => {
      try {
        const response = await api.get('/credentials/my');
        if (response.data) {
          setCertificates(response.data.map((c: any) => ({
            id: c._id || c.credentialId || c.id,
            name: c.title || c.credentialName || c.name || 'Untitled Credential',
            fileName: c.attachments?.[0]?.filename || c.fileName || '',
            status: c.status || 'pending',
            uploadedAt: c.issueDate || c.issuedOn || c.createdAt || new Date().toISOString(),
            verifiedBy: c.verifiedBy || undefined,
            verifiedAt: c.verifiedAt || undefined,
            type: c.type || 'certificate',
            institution: c.institution || c.issuer || 'Unknown',
            grade: c.grade || '',
            issueDate: c.issueDate ? new Date(c.issueDate).toLocaleDateString() : '',
            skills: c.skills || [],
            description: c.description || '',
            blockchainTxId: c.blockchainTxId || null,
            dataHash: c.dataHash || '',
            credentialId: c.credentialId || '',
            attachments: c.attachments || [],
          })));
        }
      } catch (error) {
        console.error('Failed to load credentials', error);
        // Show empty state — no mock data
        setCertificates([]);
      }
    };

    fetchCredentials();

    // Fetch skill badges from API
    const fetchSkills = async () => {
      try {
        const userId = user?.id;
        if (userId) {
          const res = await api.get(`/skill/?studentId=${userId}`);
          if (res.data?.skills && Array.isArray(res.data.skills)) {
            setSkillBadges(res.data.skills.map((s: any) => ({
              id: s._id || s.skillId || s.id,
              name: s.skillName || s.name,
              level: (s.level || 'intermediate').toLowerCase(),
              category: s.category || 'General',
              verified: s.status === 'ADDED' || s.status === 'VERIFIED',
              verifiedBy: s.issuer || undefined,
            })));
          }
        }
      } catch (e) {
        console.warn('Failed to fetch skills from blockchain, using profile skills');
        // Fallback: use skills from user record if available
        if (user?.id) {
          try {
            const profileRes = await api.get('/candidate/profile');
            const profileSkills = profileRes.data?.skills || [];
            setSkillBadges(profileSkills.map((s: any, i: number) => ({
              id: `profile-skill-${i}`,
              name: typeof s === 'string' ? s : s.name,
              level: typeof s === 'object' ? s.level : 'intermediate',
              category: 'General',
              verified: typeof s === 'object' ? s.verified : false,
            })));
          } catch (err) {
            setSkillBadges([]);
          }
        }
      }
    };

    fetchSkills();

    // Fetch job history from actual applications
    const fetchJobHistory = async () => {
      try {
        const res = await api.get('/applications/my');
        const apps = res.data?.applications || res.data || [];
        setJobHistory(apps.map((app: any) => ({
          id: app._id || app.applicationId,
          title: app.jobId?.title || app.jobTitle || 'Unknown Position',
          company: app.jobId?.company || app.company || 'Unknown Company',
          startDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '',
          endDate: app.status === 'hired' ? (app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : 'Present') : 'In Progress',
          description: app.coverLetter || '',
          skills: app.jobId?.skills || [],
          verified: app.status === 'hired',
          verifiedBy: app.status === 'hired' ? (app.jobId?.company || 'Employer') : undefined,
          verifiedAt: app.status === 'hired' ? app.updatedAt : undefined,
        })));
      } catch (e) {
        console.warn('Failed to fetch job history:', e);
        setJobHistory([]);
      }
    };
    fetchJobHistory();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExportPortfolio = () => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243);
    doc.text('Student Portfolio', 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Profile Info
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(`Name: ${studentProfile.name}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Email: ${studentProfile.email}`, 20, yPosition);
    yPosition += 20;

    // Certificates
    doc.setFontSize(18);
    doc.setTextColor(33, 150, 243);
    doc.text('Verified Credentials', 20, yPosition);
    yPosition += 10;

    certificates.forEach((cert) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${cert.name}`, 25, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`   Institution: ${cert.institution || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      doc.text(`   Status: ${cert.status}`, 25, yPosition);
      yPosition += 10;
    });

    // Save
    doc.save(`${studentProfile.name.replace(/\s+/g, '_')}_Portfolio.pdf`);
    toast({
      title: 'Portfolio Exported',
      description: 'Your portfolio has been downloaded as a PDF.',
      variant: 'success'
    });
  };

  // Callback to refresh certs after upload
  const handleUploadSuccess = async () => {
    try {
      const response = await api.get('/credentials/my');
      if (response.data) {
        setCertificates(response.data.map((c: any) => ({
          ...c,
          uploadedAt: c.issuedOn || new Date().toISOString(),
          status: c.status || 'pending'
        })));
      }
    } catch (e) {
      console.error(e);
    }
    // Switch to dashboard to see new item
    setActiveSection('dashboard');
  };

  const onViewCertificate = (cert: CertificateItem) => {
    setSelectedCertificate(cert);
    setCertificateDetailsOpen(true);
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardHome
            certificates={certificates}
            jobHistory={jobHistory}
            skillBadges={skillBadges}
            onViewCertificateRequest={onViewCertificate}
            onShareOpen={() => setShareOpen(true)}
          />
        );
      case 'upload':
        return (
          <UploadCredits
            onUploadSuccess={handleUploadSuccess}
          />
        );
      case 'portfolio':
        return (
          <Portfolio
            studentProfile={studentProfile}
            certificates={certificates}
            skillBadges={skillBadges}
            jobHistory={jobHistory}
            onExport={handleExportPortfolio}
          />
        );
      case 'share':
        return <ShareCredentials userName={studentProfile.name} />;
      case 'recommendations':
        return <Recommendations />;
      case 'analytics':
        return <Analytics />;
      default:
        return (
          <DashboardHome
            certificates={certificates}
            jobHistory={jobHistory}
            skillBadges={skillBadges}
            onViewCertificateRequest={onViewCertificate}
            onShareOpen={() => setShareOpen(true)}
          />
        );
    }
  };

  return (
    <StudentLayout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      studentProfile={studentProfile}
      onLogout={handleLogout}
    >
      {renderMainContent()}

      {/* Certificate Details Modal */}
      <CertificateDetailsModal
        isOpen={certificateDetailsOpen}
        onClose={() => setCertificateDetailsOpen(false)}
        certificate={selectedCertificate}
        onShare={() => {
          setCertificateDetailsOpen(false);
          setShareOpen(true);
        }}
      />

      {/* Quick Share Modal (Used by DashboardHome 'Share' button) */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Credentials</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Show the shareable link */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                readOnly
                value={`${window.location.origin}/profile/${user?.id || ''}`}
                className="flex-1 bg-transparent text-sm font-mono text-slate-700 outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `${window.location.origin}/profile/${user?.id || ''}`;
                  navigator.clipboard.writeText(url).then(() => {
                    toast({ title: 'Link Copied', description: 'Public profile link copied to clipboard', variant: 'success' });
                  }).catch(() => {
                    toast({ title: 'Copy Failed', description: 'Could not copy link to clipboard', variant: 'error' });
                  });
                }}
              >
                Copy
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6"
                onClick={() => {
                  const url = `${window.location.origin}/profile/${user?.id || ''}`;
                  navigator.clipboard.writeText(url).then(() => {
                    toast({ title: 'Link Copied', description: 'Public profile link copied to clipboard', variant: 'success' });
                    setShareOpen(false);
                  }).catch(() => {
                    toast({ title: 'Copy Failed', description: 'Could not copy link', variant: 'error' });
                  });
                }}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Copy Link
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-6"
                onClick={() => {
                  setShareOpen(false);
                  // Small delay to ensure dialog closes before QR modal opens
                  setTimeout(() => setQrModalOpen(true), 150);
                }}
              >
                <QrCode className="w-5 h-5 mr-2" />
                Show QR Code
              </Button>
            </div>
            <p className="text-center text-sm text-slate-500">
              Or go to the <button className="text-blue-600 underline" onClick={() => { setShareOpen(false); setActiveSection('share'); }}>Share Page</button> for more options.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal (triggered from Quick Share) */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        userId={user?.id || ''}
        userName={studentProfile.name}
      />
    </StudentLayout>
  );
}
