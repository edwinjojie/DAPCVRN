import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

export interface SkillEntry {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  verified: boolean;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
  current?: boolean;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  achievements?: string[];
}

export interface CandidateProfile {
  // Legacy flat fields
  name: string;
  email: string;
  skills: string[] | SkillEntry[];
  resumeURL: string | null;
  visibility: boolean;
  // Extended fields from Profile model
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  phone?: string;
  alternateEmail?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  headline?: string;
  bio?: string;
  currentPosition?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
  preferences?: {
    jobType?: string[];
    workLocation?: string[];
    desiredSalary?: { min?: number; max?: number; currency?: string };
    willingToRelocate?: boolean;
    availableFrom?: string;
  };
  privacy?: {
    profileVisibility?: string;
    showEmail?: boolean;
    showPhone?: boolean;
    allowMessages?: boolean;
  };
  completeness?: number;
}

export function useProfile() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/candidate/profile");
      setProfile(res.data);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to load profile';
      setError(message);
      console.error('useProfile fetch error:', err);
      if (err?.response?.status !== 401) {
        toast({ title: 'Profile Error', description: message, variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (payload: Partial<CandidateProfile>) => {
    try {
      const res = await api.put("/candidate/profile", payload);
      setProfile(res.data);
      toast({ title: "Profile updated", variant: "success" });
      return res.data;
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to update profile';
      toast({ title: "Update Failed", description: message, variant: "error" });
      throw err;
    }
  };

  const uploadResume = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await api.post('/candidate/profile/resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast({ title: 'Resume uploaded', variant: 'success' });
      // Refresh profile to get updated resume URL
      await fetchProfile();
      return res.data;
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to upload resume';
      toast({ title: 'Upload Failed', description: message, variant: 'error' });
      throw err;
    }
  };

  const calculateCompleteness = (): number => {
    if (!profile) return 0;
    let score = 0;
    if (profile.firstName || profile.name) score += 10;
    if (profile.headline || profile.bio) score += 15;
    const skills = profile.skills || [];
    if (skills.length >= 3) score += 15;
    if ((profile.education || []).length > 0) score += 15;
    if ((profile.experience || []).length > 0) score += 15;
    if (profile.phone) score += 10;
    if (profile.resumeURL) score += 10;
    if (profile.socialLinks?.linkedin) score += 5;
    if (profile.socialLinks?.github) score += 5;
    return Math.min(100, score);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, updateProfile, uploadResume, calculateCompleteness, refetch: fetchProfile };
}
