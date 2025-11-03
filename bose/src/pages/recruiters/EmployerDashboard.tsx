import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
// changed relative paths (file moved into src/pages/recruiters)
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/toast';

// Types
interface Candidate {
  id: string;
  name: string;
  skills: string[];
  experience: number;
  location: string;
  rating: number;
  verified: boolean;
}

interface CredentialRecord {
  credentialId: string;
  type?: string;
  issuer?: string;
  status?: string;
  issuedAt?: string;
}

interface SearchFilters {
  keywords: string;
  skills: string[];
  experience: string;
  location: string;
  minRating: string;
}

interface EmployeeRating {
  employeeId: string;
  tenureMonths: number;
  performance: number;
  remarks: string;
}

// Mock dummy data
const mockCandidates: Candidate[] = [
  { id: 'C-001', name: 'Edwin Joji', skills: ['React', 'Node.js', 'TypeScript'], experience: 3, location: 'San Francisco, CA', rating: 4.8, verified: true },
  { id: 'C-002', name: 'Mike Tyson', skills: ['Python', 'Machine Learning', 'TensorFlow'], experience: 5, location: 'New York, NY', rating: 4.5, verified: true },
  { id: 'C-003', name: 'Pavithra', skills: ['Java', 'Spring Boot', 'AWS'], experience: 4, location: 'Austin, TX', rating: 4.2, verified: false },
  { id: 'C-004', name: 'David Kim', skills: ['Vue.js', 'Docker', 'Kubernetes'], experience: 2, location: 'Seattle, WA', rating: 4.7, verified: true },
  { id: 'C-005', name: 'Lisa Wang', skills: ['Angular', 'RxJS', 'Firebase'], experience: 6, location: 'Los Angeles, CA', rating: 4.9, verified: true },
];

const skillOptions = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'TypeScript', 'JavaScript',
  'Machine Learning', 'TensorFlow', 'AWS', 'Docker', 'Kubernetes', 'Spring Boot', 'RxJS', 'Firebase'
];

export default function EmployerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Navigation state
  const [activePage, setActivePage] = useState<'dashboard' | 'search' | 'verify' | 'rate' | 'reports' | 'analytics'>('dashboard');
  // Handle URL hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['search', 'verify', 'rate', 'reports', 'analytics'].includes(hash)) {
        setActivePage(hash as 'dashboard' | 'search' | 'verify' | 'rate' | 'reports' | 'analytics');
      } else {
        setActivePage('dashboard');
      }
    };

    // Set initial page based on hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Search and candidates state
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    keywords: '',
    skills: [],
    experience: '',
    location: '',
    minRating: ''
  });
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(mockCandidates);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Candidate>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Verify state
  const [queryStudentId, setQueryStudentId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [credentials, setCredentials] = useState<CredentialRecord[]>([]);
  
  // Rate employees state
  const [rating, setRating] = useState<EmployeeRating>({
    employeeId: '',
    tenureMonths: 0,
    performance: 0,
    remarks: ''
  });
  
  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage);

  const employerProfile = useMemo(() => ({
    name: user?.name || 'Employer User',
    email: user?.email || 'employer@org1.com',
    organization: user?.organization || 'Org1MSP',
    role: user?.role || 'Employer/Issuer',
    company: 'TechCorp Inc.',
    contact: '+1 (555) 010-5566',
    address: '500 Industry Park, City, Country',
    department: 'Human Resources',
  }), [user]);

  // Search and filter functions
  const handleSearch = () => {
    let filtered = mockCandidates;
    
    if (searchFilters.keywords) {
      filtered = filtered.filter(candidate => 
        candidate.name.toLowerCase().includes(searchFilters.keywords.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(searchFilters.keywords.toLowerCase()))
      );
    }
    
    if (searchFilters.skills.length > 0) {
      filtered = filtered.filter(candidate => 
        searchFilters.skills.some(skill => candidate.skills.includes(skill))
      );
    }
    
    if (searchFilters.experience) {
      const exp = parseInt(searchFilters.experience);
      filtered = filtered.filter(candidate => candidate.experience >= exp);
    }
    
    if (searchFilters.location) {
      filtered = filtered.filter(candidate => 
        candidate.location.toLowerCase().includes(searchFilters.location.toLowerCase())
      );
    }
    
    if (searchFilters.minRating) {
      const rating = parseFloat(searchFilters.minRating);
      filtered = filtered.filter(candidate => candidate.rating >= rating);
    }
    
    setFilteredCandidates(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof Candidate) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    const sorted = [...filteredCandidates].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
    
    setFilteredCandidates(sorted);
  };

  const handleSkillToggle = (skill: string) => {
    setSearchFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Skills', 'Experience', 'Location', 'Rating', 'Verified'];
    const csvContent = [
      headers.join(','),
      ...filteredCandidates.map(candidate => [
        candidate.name,
        candidate.skills.join(';'),
        candidate.experience,
        candidate.location,
        candidate.rating,
        candidate.verified ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Verify functions
  const handleVerifySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryStudentId.trim()) return;
    setIsSearching(true);
    setCredentials([]);
    setStudent(null);
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.get(`${baseUrl}/api/credentials/student/${encodeURIComponent(queryStudentId.trim())}`);
      const items = (res.data?.credentials || []) as any[];
      
      const creds: CredentialRecord[] = items.map((it: any) => ({
        credentialId: it.credentialId || it.id || it.key || 'unknown',
        type: it.type || it.credentialType || 'Credential',
        issuer: it.issuer,
        status: it.status || it.state || 'unknown',
        issuedAt: it.timestamp || it.issuedAt,
      }));

      setStudent({ id: queryStudentId.trim(), name: 'Student', email: `${queryStudentId.trim().toLowerCase()}@example.com` });
      setCredentials(creds);
      
      if (creds.length === 0) {
        toast({ title: 'No credentials found', description: 'No records for this user id', variant: 'error' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to fetch credentials';
      toast({ title: 'Lookup failed', description: msg, variant: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!rating.employeeId || rating.performance < 1 || rating.performance > 10) {
      toast({ title: 'Invalid rating', description: 'Please provide valid employee ID and performance rating (1-10)', variant: 'error' });
      return;
    }
    
    try {
      // Submit to blockchain
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await axios.post(`${baseUrl}/api/ratings`, {
        employeeId: rating.employeeId,
        tenureMonths: rating.tenureMonths,
        performance: rating.performance,
        remarks: rating.remarks,
        raterId: user?.id || 'employer_001'
      });
      
      toast({ title: 'Rating submitted', description: 'Employee rating has been submitted to blockchain', variant: 'success' });
      setRating({ employeeId: '', tenureMonths: 0, performance: 0, remarks: '' });
    } catch (err: any) {
      toast({ title: 'Submission failed', description: 'Failed to submit rating to blockchain', variant: 'error' });
    }
  };


  // Render main dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {employerProfile.name}</h1>
        <p className="text-gray-600">Advanced candidate search and recruitment management</p>
      </div>

      {/* Advanced Search Form */}
      <Card>
          <CardHeader>
          <CardTitle>Advanced Candidate Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
              <Input 
                placeholder="Search by name or skills..."
                value={searchFilters.keywords} 
                onChange={(e) => setSearchFilters({ ...searchFilters, keywords: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
              <Input 
                placeholder="Minimum experience"
                type="number"
                value={searchFilters.experience} 
                onChange={(e) => setSearchFilters({ ...searchFilters, experience: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <Input 
                placeholder="City, State"
                value={searchFilters.location} 
                onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
              <Input 
                placeholder="0.0 - 5.0"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={searchFilters.minRating} 
                onChange={(e) => setSearchFilters({ ...searchFilters, minRating: e.target.value })} 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills (Multi-select)</label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map(skill => (
                <Button
                  key={skill}
                  variant={searchFilters.skills.includes(skill) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
              </Button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSearch}>Search Candidates</Button>
            <Button variant="outline" onClick={() => {
              setSearchFilters({ keywords: '', skills: [], experience: '', location: '', minRating: '' });
              setFilteredCandidates(mockCandidates);
            }}>
              Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{mockCandidates.length}</div>
            <div className="text-sm text-gray-600">Total Candidates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{mockCandidates.filter(c => c.verified).length}</div>
            <div className="text-sm text-gray-600">Verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{mockCandidates.filter(c => c.rating >= 4.5).length}</div>
            <div className="text-sm text-gray-600">High Rated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{mockCandidates.filter(c => c.experience >= 3).length}</div>
            <div className="text-sm text-gray-600">Experienced</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render search candidates page
  const renderSearchCandidates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Candidates Pool</h1>
        <Button onClick={exportToCSV} variant="outline">Export CSV</Button>
          </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('skills')}
                  >
                    Skills {sortField === 'skills' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('experience')}
                  >
                    Experience {sortField === 'experience' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('location')}
                  >
                    Location {sortField === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('rating')}
                  >
                    Rating {sortField === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                          <div className="text-sm text-gray-500">ID: {candidate.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.experience} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{candidate.rating}</span>
                        <span className="ml-1 text-yellow-400">★</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => {
                          setQueryStudentId(candidate.id);
                          window.location.hash = '#verify';
                        }}>
                          Verify
                        </Button>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredCandidates.length)}</span> of{' '}
                  <span className="font-medium">{filteredCandidates.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                </nav>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render verify page
  const renderVerify = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Verify Candidate Credentials</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleVerifySearch} className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-700">Enter Candidate User ID</label>
              <Input
                placeholder="e.g., STUDENT_001"
                value={queryStudentId}
                onChange={(e) => setQueryStudentId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? 'Searching…' : 'Search'}
            </Button>
          </form>

          {student && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Candidate Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500">User ID</span>
                  <span className="col-span-2">{student.id}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500">Name</span>
                  <span className="col-span-2">{student.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500">Email</span>
                  <span className="col-span-2 break-all">{student.email}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Blockchain Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {credentials.length === 0 ? (
                <div className="text-sm text-gray-500">No certificates to display</div>
              ) : (
                <ul className="divide-y">
                  {credentials.map((c) => (
                    <li key={c.credentialId} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{c.type} • {c.credentialId}</div>
                        <div className="text-xs text-gray-500">
                          Issuer: {c.issuer || 'Unknown'}
                          {c.issuedAt ? ` • Issued: ${new Date(c.issuedAt).toLocaleString()}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-medium ${c.status === 'verified' ? 'text-green-600' : 'text-amber-600'}`}>
                          {c.status || 'unknown'}
                        </span>
                        {c.status === 'verified' && <span className="text-green-600">✓</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );

  // Render rate employees page
  const renderRateEmployees = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Rate Employees</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Employee Performance Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
              <Input
                placeholder="Enter employee ID"
                value={rating.employeeId}
                onChange={(e) => setRating({ ...rating, employeeId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tenure (months)</label>
              <Input 
                type="number"
                placeholder="Months of employment"
                value={rating.tenureMonths} 
                onChange={(e) => setRating({ ...rating, tenureMonths: Number(e.target.value) || 0 })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Performance Rating (1-10)</label>
              <Input 
                type="number"
                min="1"
                max="10"
                placeholder="Rate performance"
                value={rating.performance} 
                onChange={(e) => setRating({ ...rating, performance: Number(e.target.value) || 0 })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
              <Input
                placeholder="Additional comments"
              value={rating.remarks} 
              onChange={(e) => setRating({ ...rating, remarks: e.target.value })} 
            />
          </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleRatingSubmit} className="w-full">
            Submit Rating to Blockchain
          </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render reports page
  const renderReports = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
            <CardTitle>Candidate Pool Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Candidates:</span>
                <span className="font-medium">{mockCandidates.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Verified Candidates:</span>
                <span className="font-medium">{mockCandidates.filter(c => c.verified).length}</span>
              </div>
              <div className="flex justify-between">
                <span>High Rated (4.5+):</span>
                <span className="font-medium">{mockCandidates.filter(c => c.rating >= 4.5).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Experienced (3+ years):</span>
                <span className="font-medium">{mockCandidates.filter(c => c.experience >= 3).length}</span>
              </div>
                </div>
            <Button className="w-full">Generate PDF Report</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
            <CardTitle>Skill Analysis</CardTitle>
              </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Most Common Skills:</span>
              </div>
              <div className="text-sm text-gray-600">
                React (3), Python (2), Node.js (2), Machine Learning (2)
              </div>
                </div>
            <Button className="w-full">Export Skill Report</Button>
              </CardContent>
            </Card>
          </div>
    </div>
  );

  // Render analytics page
  const renderAnalytics = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hiring Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">📊</div>
                <div className="text-sm text-gray-500">Bar Chart: Monthly hiring trends</div>
                <div className="text-xs text-gray-400 mt-2">Jan: 5 hires, Feb: 8 hires, Mar: 12 hires</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">🎯</div>
                <div className="text-sm text-gray-500">Radar Chart: Skill gap analysis</div>
                <div className="text-xs text-gray-400 mt-2">React: High demand, Python: Medium, Java: Low</div>
              </div>
            </div>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
            <CardTitle>Fraud Detection Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">🛡️</div>
                <div className="text-sm text-gray-500">Pie Chart: Fraud detection statistics</div>
                <div className="text-xs text-gray-400 mt-2">Verified: 85%, Suspicious: 10%, Fraudulent: 5%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Rating</span>
                <span className="text-2xl font-bold text-blue-600">4.6</span>
                </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Verification Rate</span>
                <span className="text-2xl font-bold text-green-600">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Response Time</span>
                <span className="text-2xl font-bold text-purple-600">2.3s</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="space-y-6">
      {activePage === 'dashboard' && renderDashboard()}
      {activePage === 'search' && renderSearchCandidates()}
      {activePage === 'verify' && renderVerify()}
      {activePage === 'rate' && renderRateEmployees()}
      {activePage === 'reports' && renderReports()}
      {activePage === 'analytics' && renderAnalytics()}
    </div>
  );
}