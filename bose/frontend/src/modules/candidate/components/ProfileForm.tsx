import React, { useState, useEffect, useRef } from "react";
import { useProfile, CandidateProfile, SkillEntry } from "../hooks/useProfile";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import {
  User, Briefcase, GraduationCap, Code2, Globe, Shield, Upload,
  Plus, Trash2, Save, CheckCircle2, Loader2, FileText, X
} from "lucide-react";

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
const GENDER_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function FieldInput({ value, onChange, ...props }: any) {
  return (
    <Input
      value={value || ''}
      onChange={(e: any) => onChange(e.target.value)}
      className="h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg transition-colors"
      {...props}
    />
  );
}

export default function ProfileForm() {
  const { profile, loading, error, updateProfile, uploadResume, calculateCompleteness } = useProfile();
  const resumeRef = useRef<HTMLInputElement>(null);

  // Local edit state
  const [form, setForm] = useState<Partial<CandidateProfile>>({});
  const [saving, setSaving] = useState(false);

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        gender: profile.gender || '',
        nationality: profile.nationality || '',
        phone: profile.phone || '',
        alternateEmail: profile.alternateEmail || '',
        address: profile.address || { street: '', city: '', state: '', country: '', zipCode: '' },
        headline: profile.headline || '',
        bio: profile.bio || '',
        currentPosition: profile.currentPosition || '',
        currentCompany: profile.currentCompany || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        skills: Array.isArray(profile.skills)
          ? profile.skills.map((s: any) => typeof s === 'string' ? { name: s, level: 'intermediate' as const, yearsOfExperience: 0, verified: false } : s)
          : [],
        education: profile.education || [],
        experience: profile.experience || [],
        socialLinks: profile.socialLinks || { linkedin: '', github: '', twitter: '', portfolio: '' },
        privacy: profile.privacy || { profileVisibility: 'public', showEmail: false, showPhone: false, allowMessages: true },
      });
    }
  }, [profile]);


  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
    } catch (e) {
      // toast already shown by hook
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadResume(file);
    } catch (err) {
      // toast already shown by hook
    }
  };

  // Skills management
  const addSkill = () => {
    const skills = [...(form.skills || [])] as SkillEntry[];
    skills.push({ name: '', level: 'intermediate', yearsOfExperience: 0, verified: false });
    setForm({ ...form, skills });
  };

  const removeSkill = (index: number) => {
    const skills = [...(form.skills || [])] as SkillEntry[];
    skills.splice(index, 1);
    setForm({ ...form, skills });
  };

  const updateSkill = (index: number, field: string, value: any) => {
    const skills = [...(form.skills || [])] as SkillEntry[];
    (skills[index] as any)[field] = value;
    setForm({ ...form, skills });
  };

  // Education management
  const addEducation = () => {
    const education = [...(form.education || [])];
    education.push({ institution: '', degree: '', fieldOfStudy: '', grade: '', current: false });
    setForm({ ...form, education });
  };

  const removeEducation = (index: number) => {
    const education = [...(form.education || [])];
    education.splice(index, 1);
    setForm({ ...form, education });
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const education = [...(form.education || [])];
    (education[index] as any)[field] = value;
    setForm({ ...form, education });
  };

  // Experience management
  const addExperience = () => {
    const experience = [...(form.experience || [])];
    experience.push({ company: '', position: '', location: '', startDate: '', current: false, description: '' });
    setForm({ ...form, experience });
  };

  const removeExperience = (index: number) => {
    const experience = [...(form.experience || [])];
    experience.splice(index, 1);
    setForm({ ...form, experience });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const experience = [...(form.experience || [])];
    (experience[index] as any)[field] = value;
    setForm({ ...form, experience });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const completeness = calculateCompleteness();


  return (
    <div className="space-y-6">
      {/* Profile Completeness */}
      <Card className="border-2 border-blue-100 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Profile Completeness</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete your profile to improve visibility to recruiters</p>
            </div>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{completeness}%</div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <SectionHeader icon={User} title="Personal Information" subtitle="Basic identity and contact details" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>First Name</FieldLabel>
              <FieldInput value={form.firstName} onChange={(v: string) => setForm({...form, firstName: v})} placeholder="John" />
            </div>
            <div>
              <FieldLabel required>Last Name</FieldLabel>
              <FieldInput value={form.lastName} onChange={(v: string) => setForm({...form, lastName: v})} placeholder="Doe" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FieldLabel>Date of Birth</FieldLabel>
              <FieldInput type="date" value={form.dateOfBirth} onChange={(v: string) => setForm({...form, dateOfBirth: v})} />
            </div>
            <div>
              <FieldLabel>Gender</FieldLabel>
              <select
                className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={form.gender || ''}
                onChange={e => setForm({...form, gender: e.target.value})}
              >
                {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Nationality</FieldLabel>
              <FieldInput value={form.nationality} onChange={(v: string) => setForm({...form, nationality: v})} placeholder="Indian" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Phone</FieldLabel>
              <FieldInput value={form.phone} onChange={(v: string) => setForm({...form, phone: v})} placeholder="+91 9876543210" />
            </div>
            <div>
              <FieldLabel>Alternate Email</FieldLabel>
              <FieldInput type="email" value={form.alternateEmail} onChange={(v: string) => setForm({...form, alternateEmail: v})} placeholder="alt@example.com" />
            </div>
          </div>
          <div>
            <FieldLabel>Address</FieldLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldInput value={form.address?.city} onChange={(v: string) => setForm({...form, address: {...form.address, city: v}})} placeholder="City" />
              <FieldInput value={form.address?.state} onChange={(v: string) => setForm({...form, address: {...form.address, state: v}})} placeholder="State" />
              <FieldInput value={form.address?.country} onChange={(v: string) => setForm({...form, address: {...form.address, country: v}})} placeholder="Country" />
              <FieldInput value={form.address?.zipCode} onChange={(v: string) => setForm({...form, address: {...form.address, zipCode: v}})} placeholder="ZIP Code" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card className="border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <SectionHeader icon={Briefcase} title="Professional Summary" subtitle="Your career headline and description" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <FieldLabel>Professional Headline</FieldLabel>
            <FieldInput value={form.headline} onChange={(v: string) => setForm({...form, headline: v})} placeholder="Full-Stack Developer | AI Enthusiast" />
          </div>
          <div>
            <FieldLabel>Bio</FieldLabel>
            <textarea
              className="w-full min-h-[100px] rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
              value={form.bio || ''}
              onChange={e => setForm({...form, bio: e.target.value})}
              placeholder="Tell recruiters about yourself..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FieldLabel>Current Position</FieldLabel>
              <FieldInput value={form.currentPosition} onChange={(v: string) => setForm({...form, currentPosition: v})} placeholder="Software Engineer" />
            </div>
            <div>
              <FieldLabel>Current Company</FieldLabel>
              <FieldInput value={form.currentCompany} onChange={(v: string) => setForm({...form, currentCompany: v})} placeholder="Acme Corp" />
            </div>
            <div>
              <FieldLabel>Years of Experience</FieldLabel>
              <FieldInput type="number" min={0} max={60} value={form.yearsOfExperience} onChange={(v: string) => setForm({...form, yearsOfExperience: parseInt(v) || 0})} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <SectionHeader icon={Code2} title="Skills" subtitle="Add your technical and soft skills with proficiency levels" />
            <Button variant="outline" size="sm" onClick={addSkill}>
              <Plus className="w-4 h-4 mr-1" /> Add Skill
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {((form.skills || []) as SkillEntry[]).map((skill, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <FieldInput value={skill.name} onChange={(v: string) => updateSkill(i, 'name', v)} placeholder="e.g. React, Python, Data Analysis" />
              </div>
              <select
                className="h-11 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={skill.level}
                onChange={e => updateSkill(i, 'level', e.target.value)}
              >
                {SKILL_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
              {skill.verified && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
              <Button variant="ghost" size="sm" onClick={() => removeSkill(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {(!form.skills || (form.skills as any[]).length === 0) && (
            <p className="text-sm text-gray-400 text-center py-4">No skills added yet. Click "Add Skill" to get started.</p>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <SectionHeader icon={GraduationCap} title="Education" subtitle="Academic qualifications and certifications" />
            <Button variant="outline" size="sm" onClick={addEducation}>
              <Plus className="w-4 h-4 mr-1" /> Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.education || []).map((edu, i) => (
            <div key={i} className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg space-y-3 relative">
              <Button variant="ghost" size="sm" onClick={() => removeEducation(i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <FieldLabel required>Institution</FieldLabel>
                  <FieldInput value={edu.institution} onChange={(v: string) => updateEducation(i, 'institution', v)} placeholder="University of Technology" />
                </div>
                <div>
                  <FieldLabel required>Degree</FieldLabel>
                  <FieldInput value={edu.degree} onChange={(v: string) => updateEducation(i, 'degree', v)} placeholder="B.Tech Computer Science" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <FieldLabel>Field of Study</FieldLabel>
                  <FieldInput value={edu.fieldOfStudy} onChange={(v: string) => updateEducation(i, 'fieldOfStudy', v)} placeholder="Computer Science" />
                </div>
                <div>
                  <FieldLabel>Grade/GPA</FieldLabel>
                  <FieldInput value={edu.grade} onChange={(v: string) => updateEducation(i, 'grade', v)} placeholder="3.8 GPA" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={edu.current || false} onChange={e => updateEducation(i, 'current', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    Currently studying
                  </label>
                </div>
              </div>
            </div>
          ))}
          {(!form.education || form.education.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-4">No education entries. Click "Add Education" to add one.</p>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <SectionHeader icon={Briefcase} title="Work Experience" subtitle="Previous and current positions" />
            <Button variant="outline" size="sm" onClick={addExperience}>
              <Plus className="w-4 h-4 mr-1" /> Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.experience || []).map((exp, i) => (
            <div key={i} className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg space-y-3 relative">
              <Button variant="ghost" size="sm" onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <FieldLabel required>Company</FieldLabel>
                  <FieldInput value={exp.company} onChange={(v: string) => updateExperience(i, 'company', v)} placeholder="Acme Corp" />
                </div>
                <div>
                  <FieldLabel required>Position</FieldLabel>
                  <FieldInput value={exp.position} onChange={(v: string) => updateExperience(i, 'position', v)} placeholder="Software Engineer" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <FieldLabel>Location</FieldLabel>
                  <FieldInput value={exp.location} onChange={(v: string) => updateExperience(i, 'location', v)} placeholder="Bangalore, India" />
                </div>
                <div>
                  <FieldLabel required>Start Date</FieldLabel>
                  <FieldInput type="date" value={exp.startDate ? exp.startDate.split('T')[0] : ''} onChange={(v: string) => updateExperience(i, 'startDate', v)} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={exp.current || false} onChange={e => updateExperience(i, 'current', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    Currently working
                  </label>
                </div>
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  className="w-full min-h-[60px] rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                  value={exp.description || ''}
                  onChange={e => updateExperience(i, 'description', e.target.value)}
                  placeholder="Key responsibilities and achievements..."
                />
              </div>
            </div>
          ))}
          {(!form.experience || form.experience.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-4">No experience entries. Click "Add Experience" to add one.</p>
          )}
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <SectionHeader icon={Globe} title="Social Links" subtitle="Connect your professional profiles" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>LinkedIn</FieldLabel>
              <FieldInput value={form.socialLinks?.linkedin} onChange={(v: string) => setForm({...form, socialLinks: {...form.socialLinks, linkedin: v}})} placeholder="https://linkedin.com/in/yourprofile" />
            </div>
            <div>
              <FieldLabel>GitHub</FieldLabel>
              <FieldInput value={form.socialLinks?.github} onChange={(v: string) => setForm({...form, socialLinks: {...form.socialLinks, github: v}})} placeholder="https://github.com/yourusername" />
            </div>
            <div>
              <FieldLabel>Twitter</FieldLabel>
              <FieldInput value={form.socialLinks?.twitter} onChange={(v: string) => setForm({...form, socialLinks: {...form.socialLinks, twitter: v}})} placeholder="https://twitter.com/yourusername" />
            </div>
            <div>
              <FieldLabel>Portfolio Website</FieldLabel>
              <FieldInput value={form.socialLinks?.portfolio} onChange={(v: string) => setForm({...form, socialLinks: {...form.socialLinks, portfolio: v}})} placeholder="https://yourportfolio.com" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <SectionHeader icon={Shield} title="Privacy Settings" subtitle="Control who can see your information" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <FieldLabel>Profile Visibility</FieldLabel>
            <select
              className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={form.privacy?.profileVisibility || 'public'}
              onChange={e => setForm({...form, privacy: {...form.privacy, profileVisibility: e.target.value}})}
            >
              <option value="public">Public — Anyone can view</option>
              <option value="connections-only">Connections Only</option>
              <option value="private">Private — Only you</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={form.privacy?.showEmail || false} onChange={e => setForm({...form, privacy: {...form.privacy, showEmail: e.target.checked}})} className="w-4 h-4 rounded text-blue-600" />
              Show email to recruiters
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={form.privacy?.showPhone || false} onChange={e => setForm({...form, privacy: {...form.privacy, showPhone: e.target.checked}})} className="w-4 h-4 rounded text-blue-600" />
              Show phone number
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={form.privacy?.allowMessages !== false} onChange={e => setForm({...form, privacy: {...form.privacy, allowMessages: e.target.checked}})} className="w-4 h-4 rounded text-blue-600" />
              Allow direct messages
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Resume Upload */}
      <Card className="border-2 border-gray-100 dark:border-gray-700">
        <CardHeader>
          <SectionHeader icon={FileText} title="Resume" subtitle="Upload your latest resume (PDF, DOC, DOCX)" />
        </CardHeader>
        <CardContent>
          {profile?.resumeURL ? (
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
              <FileText className="w-8 h-8 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-300">Resume uploaded</p>
                <a href={profile.resumeURL} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 dark:text-green-400 underline">View Resume</a>
              </div>
              <Button variant="outline" size="sm" onClick={() => resumeRef.current?.click()}>
                <Upload className="w-4 h-4 mr-1" /> Replace
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => resumeRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload your resume</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (max 10MB)</p>
            </div>
          )}
          <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
        </CardContent>
      </Card>

      {/* Save Button — Sticky */}
      <div className="sticky bottom-4 z-10">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/30 rounded-xl"
        >
          {saving ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-5 h-5 mr-2" /> Save Profile</>
          )}
        </Button>
      </div>
    </div>
  );
}
