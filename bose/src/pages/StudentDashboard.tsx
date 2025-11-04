import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import api from '../lib/api';
import { 
  Upload, 
  Eye, 
  Share2, 
  Lightbulb, 
  BarChart3, 
  Calendar, 
  Award, 
  Building, 
  GraduationCap,
  Briefcase,
  CheckCircle,
  Clock,
  Download,
  QrCode,
  Smartphone,
  UserCheck
} from 'lucide-react';

interface CertificateItem {
  id: string;
  name: string;
  fileName: string;
  status: 'pending' | 'verified';
  uploadedAt: string;
  type: 'degree' | 'job' | 'skill' | 'certification';
  institution?: string;
  grade?: string;
  issueDate?: string;
  expiryDate?: string;
  skills?: string[];
  description?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

interface SkillBadge {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

interface JobHistory {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills: string[];
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // State management
  const [activeSection, setActiveSection] = useState<'dashboard' | 'upload' | 'portfolio' | 'share' | 'recommendations' | 'analytics'>('dashboard');
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [skillBadges, setSkillBadges] = useState<SkillBadge[]>([]);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareOptions, setShareOptions] = useState({ expiry: '24h', scope: 'full', consent: false, nfc: false });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [certificateType, setCertificateType] = useState<'degree' | 'job' | 'course'>('degree');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [verifyingInstitution, setVerifyingInstitution] = useState<string>('');
  const [certificateDetails, setCertificateDetails] = useState({
    // Degree related
    universityName: '',
    degreeStartDate: '',
    degreeEndDate: '',
    degreeType: '',
    // Job related
    companyName: '',
    jobStartDate: '',
    jobEndDate: '',
    skillsObtained: '',
    // Course related
    courseName: '',
    courseStartDate: '',
    courseEndDate: '',
    courseSkills: ''
  });
  const [consentCheckboxes, setConsentCheckboxes] = useState({
    shareForVerification: false,
    allowPublicSharing: false
  });
  const [recommendations] = useState<Array<{ id: string; title: string; company: string; skill: string; match: number }>>([
    { id: 'job-1', title: 'Frontend Engineer', company: 'TechCorp', skill: 'React', match: 95 },
    { id: 'job-2', title: 'Data Analyst', company: 'Insightify', skill: 'Python', match: 87 },
    { id: 'job-3', title: 'Blockchain Intern', company: 'ChainWorks', skill: 'Blockchain', match: 92 },
    { id: 'job-4', title: 'Full Stack Developer', company: 'DevCorp', skill: 'JavaScript', match: 89 }
  ]);

  const studentProfile = useMemo(() => ({
    name: user?.name || 'Student User',
    email: user?.email || 'student@example.com',
    organization: user?.organization || 'Students',
    role: user?.role || 'Student',
    age: 21,
    phone: '+1 (555) 010-7788',
    address: '1234 University Ave, City, Country',
    guardianContact: '+1 (555) 019-1122',
    enrollmentId: 'ENR-2025-001',
    program: 'B.Sc. Computer Science',
  }), [user]);

  // Load credentials from API
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const response = await api.get('/api/credentials/my');
        if (response.data) {
          const transformedCreds = response.data.map((cred: any) => ({
            id: cred._id || cred.credentialId,
            name: cred.title,
            fileName: cred.attachments?.[0]?.filename || 'document.pdf',
            status: cred.status,
            uploadedAt: cred.issueDate || cred.createdAt,
            type: cred.type
          }));
          setCertificates(transformedCreds);
        }
      } catch (error) {
        console.error('Error loading credentials:', error);
        // Fallback to dummy data if API fails
        setCertificates([
          {
            id: '1',
        name: 'Bachelor of Computer Science',
        fileName: 'degree.pdf',
        status: 'verified',
        uploadedAt: '2024-01-15T10:30:00Z',
        type: 'degree',
        institution: 'BOSE University',
        grade: 'A+',
        issueDate: '2024-01-15',
        skills: ['Programming', 'Data Structures', 'Algorithms'],
        verifiedBy: 'BOSE University',
        verifiedAt: '2024-01-16T09:15:00Z'
      },
      {
        id: '2',
        name: 'React Developer Certification',
        fileName: 'react-cert.pdf',
        status: 'verified',
        uploadedAt: '2024-02-20T14:15:00Z',
        type: 'certification',
        institution: 'Meta',
        grade: '95%',
        issueDate: '2024-02-20',
        skills: ['React', 'JavaScript', 'Frontend Development'],
        verifiedBy: 'Meta Certification Authority',
        verifiedAt: '2024-02-21T11:30:00Z'
      }
    ]);
        }
      };

    loadCredentials();

    // Also load dummy data for skills and job history
    setSkillBadges([
      {
        id: '1',
        name: 'JavaScript',
        level: 'expert',
        category: 'Programming',
        verified: true,
        verifiedBy: 'CodeCraft Solutions - Technical Assessment',
        verifiedAt: '2024-01-10T16:30:00Z'
      },
      {
        id: '2',
        name: 'React',
        level: 'advanced',
        category: 'Frontend',
        verified: true,
        verifiedBy: 'Meta Certification Authority',
        verifiedAt: '2024-02-21T11:30:00Z'
      },
      {
        id: '3',
        name: 'Python',
        level: 'intermediate',
        category: 'Programming',
        verified: true,
        verifiedBy: 'BOSE University - Course Completion',
        verifiedAt: '2023-12-15T14:20:00Z'
      },
      {
        id: '4',
        name: 'Blockchain',
        level: 'beginner',
        category: 'Emerging Tech',
        verified: false
      }
    ]);

    setJobHistory([
      {
        id: '1',
        title: 'Frontend Developer Intern',
        company: 'TechStart Inc.',
        startDate: '2023-06-01',
        endDate: '2023-08-31',
        description: 'Developed responsive web applications using React and TypeScript',
        skills: ['React', 'TypeScript', 'CSS', 'Git'],
        verified: true,
        verifiedBy: 'HR Department - TechStart Inc.',
        verifiedAt: '2023-09-05T14:20:00Z'
      },
      {
        id: '2',
        title: 'Software Developer',
        company: 'CodeCraft Solutions',
        startDate: '2024-01-01',
        endDate: undefined,
        description: 'Full-stack development with focus on user experience',
        skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
        verified: true,
        verifiedBy: 'Engineering Manager - CodeCraft Solutions',
        verifiedAt: '2024-01-15T10:45:00Z'
      }
    ]);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or image file (PNG, JPEG)',
        variant: 'error'
      });
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 50MB',
        variant: 'error'
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, show a generic PDF icon
      setFilePreview('pdf');
    }
  };

  const validateForm = (): boolean => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'error'
      });
      return false;
    }

    if (!verifyingInstitution || verifyingInstitution.trim() === '') {
      toast({
        title: 'No institution specified',
        description: 'Please enter the name of the institution that will verify this credential',
        variant: 'error'
      });
      return false;
    }

    if (certificateType === 'degree') {
      const missingFields = [];
      if (!certificateDetails.universityName) missingFields.push('University Name');
      if (!certificateDetails.degreeType) missingFields.push('Degree Type');
      if (!certificateDetails.degreeStartDate) missingFields.push('Start Date');
      if (!certificateDetails.degreeEndDate) missingFields.push('End Date');

      if (missingFields.length > 0) {
        toast({
          title: 'Incomplete form',
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: 'error'
        });
        return false;
      }
    } else if (certificateType === 'job') {
      const missingFields = [];
      if (!certificateDetails.companyName) missingFields.push('Company Name');
      if (!certificateDetails.skillsObtained) missingFields.push('Skills Obtained');
      if (!certificateDetails.jobStartDate) missingFields.push('Start Date');
      if (!certificateDetails.jobEndDate) missingFields.push('End Date');

      if (missingFields.length > 0) {
        toast({
          title: 'Incomplete form',
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: 'error'
        });
        return false;
      }
    } else if (certificateType === 'course') {
      const missingFields = [];
      if (!certificateDetails.courseName) missingFields.push('Course Name');
      if (!certificateDetails.courseSkills) missingFields.push('Skills');
      if (!certificateDetails.courseStartDate) missingFields.push('Start Date');
      if (!certificateDetails.courseEndDate) missingFields.push('End Date');

      if (missingFields.length > 0) {
        toast({
          title: 'Incomplete form',
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: 'error'
        });
        return false;
      }
    }

    return true;
  };

  const handleUploadSubmit = async () => {
    console.log('Upload submit clicked!');
    console.log('Selected file:', selectedFile);
    console.log('Verifying institution:', verifyingInstitution);
    console.log('Certificate details:', certificateDetails);

    if (!validateForm()) {
      console.log('Validation failed!');
      return;
    }

    console.log('Validation passed, starting upload...');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile!);

      // Determine title and institution based on certificate type
      let title = selectedFile!.name.replace(/\.[^.]+$/, '');
      let institution = '';
      let description = '';

      if (certificateType === 'degree') {
        title = certificateDetails.degreeType || title;
        institution = certificateDetails.universityName || '';
        description = `Degree from ${certificateDetails.degreeStartDate} to ${certificateDetails.degreeEndDate}`;
      } else if (certificateType === 'job') {
        title = `Work Experience at ${certificateDetails.companyName}`;
        institution = certificateDetails.companyName || '';
        description = `Skills: ${certificateDetails.skillsObtained}`;
      } else if (certificateType === 'course') {
        title = certificateDetails.courseName || title;
        institution = 'Course Provider';
        description = `Skills: ${certificateDetails.courseSkills}`;
      }

      formData.append('title', title);
      formData.append('type', certificateType === 'degree' ? 'degree' : certificateType === 'job' ? 'achievement' : 'certificate');
      formData.append('description', description);
      formData.append('institution', verifyingInstitution); // Use the typed institution name
      formData.append('issuedOn', new Date().toISOString());

      const response = await api.post('/api/credentials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast({
          title: 'Upload successful',
          description: 'Certificate uploaded and submitted for verification',
          variant: 'success'
        });

        // Refresh credentials list
        const credsResponse = await api.get('/api/credentials/my');
        if (credsResponse.data) {
          const transformedCreds = credsResponse.data.map((cred: any) => ({
            id: cred._id || cred.credentialId,
            name: cred.title,
            fileName: cred.attachments?.[0]?.filename || 'document.pdf',
            status: cred.status,
            uploadedAt: cred.issueDate || cred.createdAt,
            type: cred.type
          }));
          setCertificates(transformedCreds);
        }

        // Close modal and reset form
        setUploadModalOpen(false);
        setSelectedFile(null);
        setFilePreview(null);
        setVerifyingInstitution('');
        setCertificateDetails({
          universityName: '',
          degreeStartDate: '',
          degreeEndDate: '',
          degreeType: '',
          companyName: '',
          jobStartDate: '',
          jobEndDate: '',
          skillsObtained: '',
          courseName: '',
          courseStartDate: '',
          courseEndDate: '',
          courseSkills: ''
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error?.response?.data?.error || 'Please try again',
        variant: 'error'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    // Handle file drop in upload modal
    if (files.length > 0) {
      toast({ title: 'Files selected', description: `${files.length} file(s) ready for upload`, variant: 'success' });
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const renderSidebar = () => (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 min-h-screen p-4">
      <div className="space-y-2">
        <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg mb-6 shadow-lg">
          <h3 className="font-semibold text-white">{studentProfile.name}</h3>
          <p className="text-sm text-blue-100">{studentProfile.role}</p>
        </div>

        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'upload', label: 'Upload Credits', icon: Upload },
          { id: 'portfolio', label: 'View Portfolio', icon: Eye },
          { id: 'share', label: 'Share', icon: Share2 },
          { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as 'dashboard' | 'upload' | 'portfolio' | 'share' | 'recommendations' | 'analytics')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
              activeSection === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white border-red-500"
        >
          Logout
        </Button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm">
          <span></span>

        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-700 border-b-2 border-blue-500 pb-2">Verified Credits Timeline</h2>
        
        {/* Degrees */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Degrees & Certifications
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {certificates.filter(c => c.type === 'degree' || c.type === 'certification').map(item => (
              <Card key={item.id} className="hover:shadow-xl transition-all border-l-4 border-l-blue-500 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-800">{item.name}</CardTitle>
                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">Verified</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{item.institution}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  {item.grade && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold">Grade: {item.grade}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-green-50 p-2 rounded-md">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Blockchain Verified</span>
                  </div>
                  {item.verifiedBy && (
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-md">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-xs">Verified by: <strong>{item.verifiedBy}</strong></span>
                    </div>
                  )}
                  {item.verifiedAt && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Verified on: {new Date(item.verifiedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">View Details</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">Share</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Job History */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
            <Briefcase className="w-6 h-6 text-green-600" />
            Job History
          </h3>
          <div className="space-y-3">
            {jobHistory.map(job => (
              <Card key={job.id} className="hover:shadow-xl transition-all border-l-4 border-l-green-500 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg text-slate-800">{job.title}</h4>
                      <p className="text-sm font-semibold text-slate-700">{job.company}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(job.startDate).toLocaleDateString()} -
                        {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Present'}
                      </p>
                      <p className="text-sm text-slate-600">{job.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full font-semibold shadow-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">Verified</span>
                    </div>
                  </div>
                  {job.verifiedBy && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-slate-700 mb-1 bg-slate-50 p-2 rounded-md">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span className="text-xs">Verified by: <strong>{job.verifiedBy}</strong></span>
                      </div>
                      {job.verifiedAt && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Verified on: {new Date(job.verifiedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Skills Badges */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
            <Award className="w-6 h-6 text-purple-600" />
            Skills Badges
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            {skillBadges.map(badge => (
              <Card key={badge.id} className="hover:shadow-xl transition-all border-l-4 border-l-purple-500 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">{badge.name}</h4>
                      <p className="text-sm text-purple-600 capitalize font-semibold">{badge.level}</p>
                      <p className="text-xs text-slate-500 font-medium">{badge.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {badge.verified ? (
                        <div className="bg-green-100 p-2 rounded-full">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="bg-yellow-100 p-2 rounded-full">
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  {badge.verified && badge.verifiedBy && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-slate-700 mb-1 bg-slate-50 p-2 rounded-md">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span className="text-xs">Verified by: <strong>{badge.verifiedBy}</strong></span>
                      </div>
                      {badge.verifiedAt && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Verified on: {new Date(badge.verifiedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Upload Credits</h1>

      <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardTitle className="text-2xl">Certificate Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="text-center space-y-4">
            <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Your Certificate</h3>
              <p className="text-slate-600 mb-4 text-base">Select the type of certificate you want to upload and provide the required details</p>
              <Button
                onClick={() => setUploadModalOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg text-lg px-8 py-6"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Certificate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">View Portfolio</h1>
        <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">
          <Download className="w-4 h-4 mr-2" />
          Export Portfolio
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-blue-200 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="text-xl">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <div className="bg-slate-50 p-3 rounded-lg">
              <label className="text-sm font-semibold text-slate-600">Name</label>
              <p className="text-base font-bold text-slate-800">{studentProfile.name}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <label className="text-sm font-semibold text-slate-600">Email</label>
              <p className="text-base font-bold text-slate-800">{studentProfile.email}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <label className="text-sm font-semibold text-slate-600">Program</label>
              <p className="text-base font-bold text-slate-800">{studentProfile.program}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <label className="text-sm font-semibold text-slate-600">Enrollment ID</label>
              <p className="text-base font-bold text-slate-800">{studentProfile.enrollmentId}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <CardTitle className="text-xl">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg shadow-lg">
                <div className="text-3xl font-bold text-white">{certificates.length}</div>
                <div className="text-sm text-blue-100 font-semibold">Certificates</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg shadow-lg">
                <div className="text-3xl font-bold text-white">{skillBadges.length}</div>
                <div className="text-sm text-green-100 font-semibold">Skills</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-lg shadow-lg">
                <div className="text-3xl font-bold text-white">{jobHistory.length}</div>
                <div className="text-sm text-purple-100 font-semibold">Jobs</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-lg shadow-lg">
                <div className="text-3xl font-bold text-white">
                  {skillBadges.filter(s => s.verified).length}
                </div>
                <div className="text-sm text-orange-100 font-semibold">Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-slate-200 shadow-xl bg-white">
        <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
          <CardTitle className="text-2xl text-white">Complete Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Education */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Education
              </h3>
              <div className="space-y-3">
                {certificates.filter(c => c.type === 'degree').map(cert => (
                  <div key={cert.id} className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-3 rounded-r-lg">
                    <h4 className="font-bold text-slate-800">{cert.name}</h4>
                    <p className="text-sm text-slate-700 font-semibold">{cert.institution}</p>
                    <p className="text-sm text-slate-600">{cert.grade} • {cert.issueDate}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-slate-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-600" />
                Experience
              </h3>
              <div className="space-y-3">
                {jobHistory.map(job => (
                  <div key={job.id} className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded-r-lg">
                    <h4 className="font-bold text-slate-800">{job.title}</h4>
                    <p className="text-sm text-slate-700 font-semibold">{job.company}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(job.startDate).toLocaleDateString()} -
                      {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Present'}
                    </p>
                    <p className="text-sm text-slate-700">{job.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillBadges.map(badge => (
                  <span
                    key={badge.id}
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      badge.verified
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md'
                    }`}
                  >
                    {badge.name} ({badge.level})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderShare = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Share Credentials</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-green-200 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardTitle className="text-xl">Quick Share</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Button
              onClick={() => setShareOpen(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg py-6 text-base"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Generate Share Link
            </Button>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg py-6 text-base">
              <QrCode className="w-5 h-5 mr-2" />
              Generate QR Code
            </Button>
            <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg py-6 text-base">
              <Smartphone className="w-5 h-5 mr-2" />
              NFC Share
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="text-xl">Recent Shares</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800">Portfolio Link</span>
                <span className="text-slate-600 font-medium">2 days ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800">Degree Certificate</span>
                <span className="text-slate-600 font-medium">1 week ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">AI Recommendations</h1>

      <div className="grid gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="hover:shadow-xl transition-all border-l-4 border-l-yellow-500 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">{rec.title}</h3>
                  <p className="text-slate-700 font-semibold">{rec.company}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-medium">Matched Skill:</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full font-semibold shadow-md">
                      {rec.skill}
                    </span>
                    <span className="text-base font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      {rec.match}% match
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-slate-600 hover:bg-slate-700 text-white">View Details</Button>
                  <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">Apply</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-purple-200 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <CardTitle className="text-xl">Skill Proficiency</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center border-2 border-purple-200">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-purple-600 mx-auto mb-2" />
                <p className="text-slate-700 font-semibold">Pie Chart: Skill Proficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="text-xl">Career Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 rounded-lg bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center border-2 border-blue-200">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                <p className="text-slate-700 font-semibold">Line Graph: Career Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-green-200 shadow-xl bg-white">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardTitle className="text-xl">Export Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'upload':
        return renderUpload();
      case 'portfolio':
        return renderPortfolio();
      case 'share':
        return renderShare();
      case 'recommendations':
        return renderRecommendations();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {renderSidebar()}
      <div className="flex-1 p-8">
        {renderMainContent()}
      </div>

      {/* Certificate Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Certificate Type Selection */}
            <div>
              <label className="text-sm font-semibold text-slate-800 mb-2 block">Certificate Type</label>
              <select
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value as 'degree' | 'job' | 'course')}
              >
                <option value="degree">Degree Related</option>
                <option value="job">Job Related</option>
                <option value="course">Course Related</option>
              </select>
            </div>

            {/* Degree Related Fields */}
            {certificateType === 'degree' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Degree Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      University Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter university name"
                      value={certificateDetails.universityName}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, universityName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      Type of Degree <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      value={certificateDetails.degreeType}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, degreeType: e.target.value })}
                      required
                    >
                      <option value="">Select degree type</option>
                      <option value="UG">Undergraduate (UG)</option>
                      <option value="PG">Postgraduate (PG)</option>
                      <option value="Doctorate">Doctorate</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Poly">Polytechnic</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      Course Starting Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={certificateDetails.degreeStartDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, degreeStartDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      Course Ending Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={certificateDetails.degreeEndDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, degreeEndDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Job Related Fields */}
            {certificateType === 'job' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter company name"
                      value={certificateDetails.companyName}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, companyName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      Starting Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={certificateDetails.jobStartDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, jobStartDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      Ending Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={certificateDetails.jobEndDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, jobEndDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      Skills Obtained <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter skills (comma separated)"
                      value={certificateDetails.skillsObtained}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, skillsObtained: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Course Related Fields */}
            {certificateType === 'course' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Course Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      Course Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter course name"
                      value={certificateDetails.courseName}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, courseName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      Skills Obtained <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter skills (comma separated)"
                      value={certificateDetails.courseSkills}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, courseSkills: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      Starting Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={certificateDetails.courseStartDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, courseStartDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800 mb-1 block">
                      Ending Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={certificateDetails.courseEndDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, courseEndDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Institution Name Input */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-bold text-slate-800">Verifying Institution <span className="text-red-500">*</span></h3>
              <div>
                <label className="text-sm font-semibold text-slate-800 mb-2 block">
                  Enter the name of the institution that will verify this credential
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Massachusetts Institute of Technology, Stanford University"
                  value={verifyingInstitution}
                  onChange={(e) => setVerifyingInstitution(e.target.value)}
                  required
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This should be the official name of the institution that issued or can verify this credential
                </p>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Upload Certificate File <span className="text-red-500">*</span></h3>

              {!selectedFile ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed rounded-lg p-6 text-center text-gray-500 hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm mb-2">Drag & drop your certificate file here, or</p>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button onClick={handleUploadClick} disabled={isUploading} size="sm" variant="outline">
                      Select File
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Supports PDF and image files (max 50MB)</p>
                </div>
              ) : (
                <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* File Preview */}
                    <div className="flex-shrink-0">
                      {filePreview === 'pdf' ? (
                        <div className="w-20 h-20 bg-red-100 rounded flex items-center justify-center">
                          <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                            <text x="50%" y="60%" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">PDF</text>
                          </svg>
                        </div>
                      ) : (
                        <img
                          src={filePreview || ''}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded border"
                        />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        File selected
                      </p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-lg font-medium">Consent & Sharing</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    checked={consentCheckboxes.shareForVerification} 
                    onChange={(e) => setConsentCheckboxes({ ...consentCheckboxes, shareForVerification: e.target.checked })} 
                    className="mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">Share for Verification</span>
                    <p className="text-xs text-gray-600">I consent to share my certificate details with authorized verifiers for credential verification purposes.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    checked={consentCheckboxes.allowPublicSharing} 
                    onChange={(e) => setConsentCheckboxes({ ...consentCheckboxes, allowPublicSharing: e.target.checked })} 
                    className="mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">Allow Public Sharing</span>
                    <p className="text-xs text-gray-600">I consent to make my verified credentials publicly shareable for portfolio and networking purposes.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFile(null);
                  setFilePreview(null);
                  setVerifyingInstitution('');
                  setCertificateDetails({
                    universityName: '',
                    degreeStartDate: '',
                    degreeEndDate: '',
                    degreeType: '',
                    companyName: '',
                    jobStartDate: '',
                    jobEndDate: '',
                    skillsObtained: '',
                    courseName: '',
                    courseStartDate: '',
                    courseEndDate: '',
                    courseSkills: ''
                  });
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadSubmit}
                disabled={!consentCheckboxes.shareForVerification || isUploading || !selectedFile}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Upload Certificate'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Share Modal */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Credentials</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Expiry</label>
                <select 
                  className="w-full border rounded px-3 py-2 mt-1" 
                  value={shareOptions.expiry} 
                  onChange={(e) => setShareOptions({ ...shareOptions, expiry: e.target.value })}
                >
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Scope</label>
                <select 
                  className="w-full border rounded px-3 py-2 mt-1" 
                  value={shareOptions.scope} 
                  onChange={(e) => setShareOptions({ ...shareOptions, scope: e.target.value })}
                >
                  <option value="full">Full Portfolio</option>
                  <option value="partial">Selected Items</option>
                  <option value="public">Public Profile</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={shareOptions.consent} 
                  onChange={(e) => setShareOptions({ ...shareOptions, consent: e.target.checked })} 
                />
                <span className="text-sm">Consent to share sensitive data</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={shareOptions.nfc} 
                  onChange={(e) => setShareOptions({ ...shareOptions, nfc: e.target.checked })} 
                />
                <span className="text-sm">Enable NFC sharing</span>
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">QR Code Preview</label>
                <div className="h-40 rounded bg-gray-100 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">Share Link</label>
                <Input 
                  readOnly 
                  value={`https://share.bose/cred/${user?.name || 'user'}?exp=${shareOptions.expiry}&scope=${shareOptions.scope}`} 
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">Copy Link</Button>
                  <Button className="flex-1">Generate & Share</Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


