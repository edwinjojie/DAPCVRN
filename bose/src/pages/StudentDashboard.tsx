import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
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

  // Initialize dummy data
  React.useEffect(() => {
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

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // For demo purposes we simulate upload and pending verification
      const newItem: CertificateItem = {
        id: `${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        fileName: file.name,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        type: 'certification',
      };
      setCertificates(prev => [newItem, ...prev]);
      toast({ title: 'Upload received', description: 'Certificate submitted for verification', variant: 'success' });
    } catch {
      toast({ title: 'Upload failed', description: 'Please try again', variant: 'error' });
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
    <div className="w-64 bg-gray-50 border-r min-h-screen p-4">
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg mb-6">
          <h3 className="font-semibold">{studentProfile.name}</h3>
          <p className="text-sm text-gray-600">{studentProfile.role}</p>
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
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
              activeSection === item.id 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </div>
      
      <div className="mt-8">
        <Button variant="outline" onClick={handleLogout} className="w-full">
          Logout
        </Button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm">
          <span></span>
         
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Verified Credits Timeline</h2>
        
        {/* Degrees */}
        <div className="space-y-3">
          <h3 className="text-md font-medium flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Degrees & Certifications
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {certificates.filter(c => c.type === 'degree' || c.type === 'certification').map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">Verified</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="w-4 h-4" />
                    <span>{item.institution}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  {item.grade && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>Grade: {item.grade}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Blockchain Verified</span>
                  </div>
                  {item.verifiedBy && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-xs">Verified by: {item.verifiedBy}</span>
                    </div>
                  )}
                  {item.verifiedAt && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Verified on: {new Date(item.verifiedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Share</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Job History */}
        <div className="space-y-3">
          <h3 className="text-md font-medium flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Job History
          </h3>
          <div className="space-y-3">
            {jobHistory.map(job => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.company}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(job.startDate).toLocaleDateString()} - 
                        {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Present'}
                      </p>
                      <p className="text-sm text-gray-700">{job.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skills.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">Verified</span>
                    </div>
                  </div>
                  {job.verifiedBy && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <UserCheck className="w-4 h-4" />
                        <span className="text-xs">Verified by: {job.verifiedBy}</span>
                      </div>
                      {job.verifiedAt && (
                        <div className="flex items-center gap-2 text-gray-500">
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
          <h3 className="text-md font-medium flex items-center gap-2">
            <Award className="w-5 h-5" />
            Skills Badges
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            {skillBadges.map(badge => (
              <Card key={badge.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{badge.level}</p>
                      <p className="text-xs text-gray-500">{badge.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {badge.verified ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                  {badge.verified && badge.verifiedBy && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <UserCheck className="w-4 h-4" />
                        <span className="text-xs">Verified by: {badge.verifiedBy}</span>
                      </div>
                      {badge.verifiedAt && (
                        <div className="flex items-center gap-2 text-gray-500">
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
      <h1 className="text-2xl font-bold">Upload Credits</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Certificate Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <Upload className="w-16 h-16 mx-auto text-gray-400" />
            <div>
              <h3 className="text-lg font-medium mb-2">Upload Your Certificate</h3>
              <p className="text-gray-600 mb-4">Select the type of certificate you want to upload and provide the required details</p>
              <Button onClick={() => setUploadModalOpen(true)} size="lg">
                <Upload className="w-4 h-4 mr-2" />
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
        <h1 className="text-2xl font-bold">View Portfolio</h1>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Portfolio
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-sm">{studentProfile.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-sm">{studentProfile.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Program</label>
              <p className="text-sm">{studentProfile.program}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Enrollment ID</label>
              <p className="text-sm">{studentProfile.enrollmentId}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{certificates.length}</div>
                <div className="text-sm text-gray-600">Certificates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{skillBadges.length}</div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{jobHistory.length}</div>
                <div className="text-sm text-gray-600">Jobs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {skillBadges.filter(s => s.verified).length}
                </div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complete Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Education */}
            <div>
              <h3 className="text-lg font-medium mb-3">Education</h3>
              <div className="space-y-3">
                {certificates.filter(c => c.type === 'degree').map(cert => (
                  <div key={cert.id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">{cert.name}</h4>
                    <p className="text-sm text-gray-600">{cert.institution}</p>
                    <p className="text-sm text-gray-500">{cert.grade} • {cert.issueDate}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-lg font-medium mb-3">Experience</h3>
              <div className="space-y-3">
                {jobHistory.map(job => (
                  <div key={job.id} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(job.startDate).toLocaleDateString()} - 
                      {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Present'}
                    </p>
                    <p className="text-sm text-gray-700">{job.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-medium mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skillBadges.map(badge => (
                  <span 
                    key={badge.id} 
                    className={`px-3 py-1 rounded-full text-sm ${
                      badge.verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
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
      <h1 className="text-2xl font-bold">Share Credentials</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Share</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setShareOpen(true)} className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Generate Share Link
            </Button>
            <Button variant="outline" className="w-full">
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
            <Button variant="outline" className="w-full">
              <Smartphone className="w-4 h-4 mr-2" />
              NFC Share
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Portfolio Link</span>
                <span className="text-gray-500">2 days ago</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Degree Certificate</span>
                <span className="text-gray-500">1 week ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Recommendations</h1>
      
      <div className="grid gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{rec.title}</h3>
                  <p className="text-gray-600">{rec.company}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Matched Skill:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {rec.skill}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {rec.match}% match
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm">Apply</Button>
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
      <h1 className="text-2xl font-bold">Analytics</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skill Proficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Pie Chart: Skill Proficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Career Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Line Graph: Career Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline">
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
    <div className="flex min-h-screen bg-gray-50">
      {renderSidebar()}
      <div className="flex-1 p-6">
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Certificate Type</label>
              <select 
                className="w-full border rounded px-3 py-2" 
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
                <h3 className="text-lg font-medium">Degree Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">University Name</label>
                    <Input 
                      placeholder="Enter university name"
                      value={certificateDetails.universityName}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, universityName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Type of Degree</label>
                    <select 
                      className="w-full border rounded px-3 py-2" 
                      value={certificateDetails.degreeType} 
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, degreeType: e.target.value })}
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
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Course Starting Date</label>
                    <Input 
                      type="date"
                      value={certificateDetails.degreeStartDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, degreeStartDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Course Ending Date</label>
                    <Input 
                      type="date"
                      value={certificateDetails.degreeEndDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, degreeEndDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Job Related Fields */}
            {certificateType === 'job' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Company Name</label>
                    <Input 
                      placeholder="Enter company name"
                      value={certificateDetails.companyName}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Starting Date</label>
                    <Input 
                      type="date"
                      value={certificateDetails.jobStartDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, jobStartDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Ending Date</label>
                    <Input 
                      type="date"
                      value={certificateDetails.jobEndDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, jobEndDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Skills Obtained</label>
                    <Input 
                      placeholder="Enter skills (comma separated)"
                      value={certificateDetails.skillsObtained}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, skillsObtained: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Course Related Fields */}
            {certificateType === 'course' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Course Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Course Name</label>
                    <Input 
                      placeholder="Enter course name"
                      value={certificateDetails.courseName}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, courseName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Skills Obtained</label>
                    <Input 
                      placeholder="Enter skills (comma separated)"
                      value={certificateDetails.courseSkills}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, courseSkills: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Starting Date</label>
                    <Input 
                      type="date"
                      value={certificateDetails.courseStartDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, courseStartDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Ending Date</label>
                    <Input 
                      type="date"
                      value={certificateDetails.courseEndDate}
                      onChange={(e) => setCertificateDetails({ ...certificateDetails, courseEndDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Upload Certificate File</h3>
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
                  <Button onClick={handleUploadClick} disabled={isUploading} size="sm">
                    {isUploading ? 'Uploading…' : 'Select File'}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Supports PDF and image files</p>
              </div>
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
              <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Handle form submission
                  toast({ title: 'Certificate uploaded', description: 'Your certificate has been submitted for verification', variant: 'success' });
                  setUploadModalOpen(false);
                }}
                disabled={!consentCheckboxes.shareForVerification}
              >
                Upload Certificate
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


