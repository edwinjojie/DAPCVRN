import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle, 
  GraduationCap, 
  Calendar, 
  Award, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  Briefcase,
  XCircle,
  Clock,
  Download,
  FileText
} from 'lucide-react';

interface PortfolioData {
  id: string;
  candidate: {
    name: string;
    role: string;
    email: string;
    phone: string;
    location: string;
    photoUrl?: string;
    bio: string;
    links: Array<{ label: string; url: string }>;
  };
  skills: Array<{ name: string; level: string }>;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
    verified: boolean;
    verificationData?: {
      status: string;
      verifiedBy: string;
      blockchainTxId: string;
    };
  }>;
  otherVerifiedCredentials: Array<{
    title: string;
    issuer: string;
    date: string;
    status: string;
    blockchainTxId?: string;
  }>;
}

export default function PortfolioPage() {
  const params = useParams();
  const id = params.id;
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        
        const modules = import.meta.glob('/src/data/*.json');
        const path = `/src/data/${id}.json`;
        
        if (modules[path]) {
          const module: any = await modules[path]();
          setData(module.default);
        } else {
          setError(`Portfolio not found.`);
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="font-medium text-slate-600 italic">Retrieving secure portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-center">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-200">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Portfolio Error</h2>
          <p className="mt-2 text-slate-600">{error}</p>
          <button onClick={() => window.location.href = '/'} className="mt-6 px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors">Go Home</button>
        </div>
      </div>
    );
  }

  const candidate = data.candidate;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm pt-12 pb-16">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
          {candidate.photoUrl ? (
            <img src={candidate.photoUrl} alt={candidate.name} className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover shadow-2xl ring-4 ring-blue-50" />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold shadow-2xl ring-4 ring-blue-50">
              {candidate.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{candidate.name}</h1>
              <p className="text-xl font-semibold text-blue-600 mt-1">{candidate.role}</p>
            </div>
            
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">{candidate.bio}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <MapPin className="w-4 h-4" /> {candidate.location}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <Mail className="w-4 h-4" /> {candidate.email}
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <Phone className="w-4 h-4" /> {candidate.phone}
                </div>
              )}
            </div>

            <div className="flex justify-center md:justify-start gap-4 pt-4">
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                <Mail className="w-4 h-4" /> Contact Me
              </button>
              <button className="px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" /> Download CV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column - Portfolio Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Experience */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-blue-600" /> Work Experience
            </h2>
            <div className="space-y-8">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-blue-600 before:rounded-full after:absolute after:left-[5px] after:top-6 after:w-[2px] after:h-[calc(100%-1rem)] after:bg-slate-200 last:after:hidden">
                  <h3 className="text-xl font-bold text-slate-800">{exp.role}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="font-semibold text-blue-600">{exp.company}</p>
                    <span className="text-sm text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{exp.duration}</span>
                  </div>
                  <p className="mt-3 text-slate-600 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Education - Focus on Verification */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-blue-600" /> Education
            </h2>
            <div className="space-y-6">
              {data.education.map((edu, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-800">{edu.degree}</h3>
                      <p className="text-slate-600 font-medium">{edu.institution}</p>
                      <p className="text-sm text-slate-500">{edu.year}</p>
                    </div>
                    {edu.verified ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5" /> Blockchain Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-100 shadow-sm">
                        <Clock className="w-3.5 h-3.5" /> Pending Verification
                      </div>
                    )}
                  </div>
                  {edu.verified && edu.verificationData && (
                    <div className="mt-4 pt-4 border-t border-slate-50">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>TX: {edu.verificationData.blockchainTxId.substring(0, 20)}...</span>
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {edu.verificationData.verifiedBy}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Additional Credentials */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Award className="w-6 h-6 text-blue-600" /> Professional Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.otherVerifiedCredentials.map((cred, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-colors">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shadow-inner">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{cred.title}</h4>
                    <p className="text-xs text-slate-500">{cred.issuer} • {cred.date}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      {cred.status === 'verified' ? (
                        <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" /> Verified</span>
                      ) : (
                        <span className="text-[10px] font-bold text-yellow-600 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-10">
          {/* Skills */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4 px-1">Top Skills</h2>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {data.skills.map((skill, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-700">{skill.name}</span>
                    <span className="text-blue-600 font-semibold">{skill.level}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full shadow-sm shadow-blue-200" 
                      style={{ width: skill.level === 'Expert' ? '95%' : skill.level === 'Advanced' ? '80%' : '60%' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Social / Links */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4 px-1">Online Presence</h2>
            <div className="space-y-3">
              {candidate.links.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {link.label === 'GitHub' ? <Github className="w-5 h-5 text-slate-700" /> : 
                     link.label === 'LinkedIn' ? <Linkedin className="w-5 h-5 text-blue-600" /> : 
                     <FileText className="w-5 h-5 text-slate-500" />}
                    <span className="font-bold text-slate-700">{link.label}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
          </section>

          {/* Portfolio Footer - Minimalist BOSE Branding */}
          <div className="pt-10 border-t border-slate-200 text-center">
             <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <Shield className="w-3 h-3" /> Blockchain Secured Portfolio
             </div>
             <p className="mt-3 text-slate-300 text-[9px] font-medium">Verified by BOSE Ecosystem</p>
          </div>
        </div>
      </div>
    </div>
  );
}