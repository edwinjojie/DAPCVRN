import React, { useState, useEffect } from 'react';
import { Upload, X, Shield, FileText, Code2, Plus, Loader2, Award } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { useToast } from '../../../../components/ui/toast';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../lib/api';

interface UploadCreditsProps {
    onUploadSuccess: () => void;
}

const SKILL_CATEGORIES = [
    'Programming', 'Data Science', 'Web Development', 'Mobile Development',
    'Cloud Computing', 'DevOps', 'Design', 'Management',
    'Communication', 'Machine Learning', 'Cybersecurity', 'Other'
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function UploadCredits({ onUploadSuccess }: UploadCreditsProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'certificate' | 'skill'>('certificate');
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);

    // Certificate Form State
    const [certificateDetails, setCertificateDetails] = useState({
        name: '',
        type: 'certificate',
        institutionId: '',
        institutionName: '',
        issueDate: '',
        description: '',
        publicShare: true,
        verificationShare: true
    });

    // Skill Form State
    const [skillForm, setSkillForm] = useState({
        skillName: '',
        category: 'Programming',
        level: 'Intermediate',
        requestVerification: false,
        institutionName: '',
    });
    const [addingSkill, setAddingSkill] = useState(false);

    useEffect(() => {
        // List institutions for dropdown
        api.get('/institutions')
            .then(res => setInstitutions(res.data || []))
            .catch(err => console.error(err));
    }, []);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        // Validate file type
        if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
            toast({ title: "Invalid file type", description: "Please upload a PDF or Image file.", variant: "error" });
            return;
        }
        // Validate size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            toast({ title: "File too large", description: "Max file size is 50MB.", variant: "error" });
            return;
        }

        setSelectedFile(file);
        // Auto-fill name if empty
        if (!certificateDetails.name) {
            setCertificateDetails(prev => ({ ...prev, name: file.name.split('.')[0] }));
        }
        setUploadModalOpen(true);
    };

    const handleUploadSubmit = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', certificateDetails.name);
        formData.append('type', certificateDetails.type);
        formData.append('institutionId', certificateDetails.institutionId || 'manual');
        formData.append('institution', certificateDetails.institutionName || 'manual');
        formData.append('issueDate', certificateDetails.issueDate);
        formData.append('description', certificateDetails.description);

        try {
            await api.post('/credentials/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast({ title: "Upload Successful", description: "Your credential has been submitted for verification.", variant: "success" });
            setUploadModalOpen(false);
            setSelectedFile(null);
            setCertificateDetails({
                name: '', type: 'certificate', institutionId: '', institutionName: '', issueDate: '', description: '', publicShare: true, verificationShare: true
            });
            onUploadSuccess();
        } catch (error) {
            toast({ title: "Upload Failed", description: "Could not upload file. Please try again.", variant: "error" });
            console.error(error);
        }
    };

    // ── Add Skill Handler ─────────────────────────────────────────────────────
    const handleAddSkill = async () => {
        if (!skillForm.skillName.trim()) {
            toast({ title: "Missing Skill Name", description: "Please enter a skill name.", variant: "error" });
            return;
        }

        if (skillForm.requestVerification && !skillForm.institutionName) {
            toast({ title: "Missing Institution", description: "Please select an institution for verification.", variant: "error" });
            return;
        }

        setAddingSkill(true);
        try {
            const skillId = `SK_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            await api.post('/skill/add', {
                skillId,
                studentId: user?.id || '',
                studentName: user?.name || '',
                skillName: skillForm.skillName.trim(),
                category: skillForm.category,
                level: skillForm.level.toLowerCase(),
                issuer: skillForm.requestVerification ? skillForm.institutionName : 'Self-Declared',
                identity: 'college_xyz',
                role: 'institution',
            });

            // If verification was requested, submit the verification request
            if (skillForm.requestVerification && skillForm.institutionName) {
                try {
                    await api.post('/skill/request-verification', {
                        skillId,
                        institutionName: skillForm.institutionName,
                    });
                    toast({
                        title: "Skill Added & Verification Requested",
                        description: `"${skillForm.skillName}" has been added and sent to ${skillForm.institutionName} for verification.`,
                        variant: "success"
                    });
                } catch (verifyErr: any) {
                    console.warn('Verification request failed:', verifyErr);
                    toast({
                        title: "Skill Added (Verification Failed)",
                        description: `Skill was added but the verification request failed: ${verifyErr?.response?.data?.error || verifyErr.message}`,
                        variant: "warning"
                    });
                }
            } else {
                toast({
                    title: "Skill Added",
                    description: `"${skillForm.skillName}" has been added to your profile and submitted to the blockchain.`,
                    variant: "success"
                });
            }

            setSkillForm({ skillName: '', category: 'Programming', level: 'Intermediate', requestVerification: false, institutionName: '' });
            onUploadSuccess();
        } catch (error: any) {
            console.error('Failed to add skill:', error);
            toast({
                title: "Failed to Add Skill",
                description: error?.response?.data?.error || "Could not add skill. Please try again.",
                variant: "error"
            });
        } finally {
            setAddingSkill(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Upload Credits</h1>

            {/* Tab Switcher */}
            <div className="flex bg-slate-100 rounded-xl p-1.5 gap-1">
                <button
                    onClick={() => setActiveTab('certificate')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        activeTab === 'certificate'
                            ? 'bg-white text-blue-700 shadow-md shadow-blue-100'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    <Award className="w-4 h-4" />
                    Upload Certificate
                </button>
                <button
                    onClick={() => setActiveTab('skill')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        activeTab === 'skill'
                            ? 'bg-white text-emerald-700 shadow-md shadow-emerald-100'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    <Code2 className="w-4 h-4" />
                    Add Skill
                </button>
            </div>

            {/* ── Certificate Tab ───────────────────────────────────────────── */}
            {activeTab === 'certificate' && (
                <Card className="border-2 border-dashed border-slate-300 bg-slate-50 min-h-[400px] flex flex-col items-center justify-center text-center p-12 hover:bg-slate-100 transition-colors"
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                    {dragActive ? (
                        <div className="pointer-events-none animate-pulse">
                            <Upload className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                            <p className="text-xl font-bold text-blue-600">Drop file here...</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <Upload className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Drag & Drop your certificate</h3>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                                Supports PDF, JPG, PNG (Max 50MB). We'll analyze it for verification.
                            </p>
                            <div className="relative">
                                <input type="file" id="file-upload" className="hidden" onChange={handleChange} accept=".pdf,image/*" />
                                <Button 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg shadow-lg shadow-blue-200 cursor-pointer pointer-events-auto" 
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <FileText className="w-5 h-5 mr-2" /> Browse Files
                                </Button>
                            </div>
                        </>
                    )}
                </Card>
            )}

            {/* ── Add Skill Tab ────────────────────────────────────────────── */}
            {activeTab === 'skill' && (
                <Card className="border-2 border-emerald-100 shadow-xl bg-white overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Code2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold m-0">Add a New Skill</CardTitle>
                                <p className="text-emerald-100 text-sm mt-1">Skills are recorded on the blockchain for verifiable proof.</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Skill Name */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Skill Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={skillForm.skillName}
                                onChange={e => setSkillForm({ ...skillForm, skillName: e.target.value })}
                                placeholder="e.g. React, Python, Data Analysis, Docker..."
                                className="h-12 border-2 border-slate-200 focus:border-emerald-500 rounded-lg text-base"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                <select
                                    className="w-full h-12 rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    value={skillForm.category}
                                    onChange={e => setSkillForm({ ...skillForm, category: e.target.value })}
                                >
                                    {SKILL_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Level */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Proficiency Level</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SKILL_LEVELS.map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setSkillForm({ ...skillForm, level })}
                                            className={`px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                                                skillForm.level === level
                                                    ? level === 'Expert'
                                                        ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm'
                                                        : level === 'Advanced'
                                                        ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-sm'
                                                        : level === 'Intermediate'
                                                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm'
                                                        : 'bg-slate-50 border-slate-400 text-slate-800 shadow-sm'
                                                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Verification Toggle */}
                        <div className="border-2 border-slate-200 rounded-xl p-4 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={skillForm.requestVerification}
                                        onChange={e => setSkillForm({ ...skillForm, requestVerification: e.target.checked, institutionName: e.target.checked ? skillForm.institutionName : '' })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-slate-700">Request verification from an institution</span>
                                    <p className="text-xs text-slate-500 mt-0.5">An institution can verify and endorse this skill on the blockchain</p>
                                </div>
                            </label>

                            {skillForm.requestVerification && (
                                <div className="pt-2 animate-fade-in">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Verifying Institution <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full h-12 rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                        value={skillForm.institutionName}
                                        onChange={e => setSkillForm({ ...skillForm, institutionName: e.target.value })}
                                    >
                                        <option value="">Select Institution...</option>
                                        {institutions.map(inst => (
                                            <option key={inst.id} value={inst.name}>{inst.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-2">
                                        The institution will receive a verification request and can approve or reject it.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Info Box */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-emerald-800">Blockchain Verified</p>
                                    <p className="text-xs text-emerald-600 mt-1">
                                        This skill will be recorded on the Hyperledger Fabric blockchain, creating an immutable record that can be verified by employers and institutions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleAddSkill}
                            disabled={addingSkill || !skillForm.skillName.trim()}
                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {addingSkill ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Adding Skill...</>
                            ) : (
                                <><Plus className="w-5 h-5 mr-2" /> Add Skill to Blockchain</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Upload Modal - Certificate submission details */}
            {uploadModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg bg-white shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
                            <CardTitle>Verify & Submit</CardTitle>
                            <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-red-500"><X /></button>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="bg-slate-50 p-3 rounded-lg flex items-center mb-4">
                                <FileText className="w-8 h-8 text-blue-500 mr-3" />
                                <div className="overflow-hidden">
                                    <p className="font-medium truncate">{selectedFile?.name}</p>
                                    <p className="text-xs text-slate-500">{((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Certificate Name</label>
                                    <Input
                                        value={certificateDetails.name}
                                        onChange={e => setCertificateDetails({ ...certificateDetails, name: e.target.value })}
                                        placeholder="e.g. Advanced React Pattern"
                                        className="mt-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Type</label>
                                        <select
                                            className="w-full mt-1 p-2 border rounded-md"
                                            value={certificateDetails.type}
                                            onChange={e => setCertificateDetails({ ...certificateDetails, type: e.target.value })}
                                        >
                                            <option value="certificate">Certification</option>
                                            <option value="degree">Degree</option>
                                            <option value="course">Course Completion</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Issue Date</label>
                                        <Input
                                            type="date"
                                            value={certificateDetails.issueDate}
                                            onChange={e => setCertificateDetails({ ...certificateDetails, issueDate: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Verifying Institution</label>
                                    <select
                                        className="w-full mt-1 p-2 border rounded-md"
                                        value={certificateDetails.institutionId}
                                        onChange={e => {
                                            const inst = institutions.find(i => i.id === e.target.value);
                                            setCertificateDetails({ 
                                                ...certificateDetails, 
                                                institutionId: e.target.value,
                                                institutionName: inst ? inst.name : (e.target.value === 'manual' ? 'manual' : '')
                                            });
                                        }}
                                    >
                                        <option value="">Select Institution...</option>
                                        {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                                        <option value="manual">Other (Manual Verification)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-6 space-y-3">
                                <label className="flex items-start space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={certificateDetails.verificationShare}
                                        onChange={e => setCertificateDetails({ ...certificateDetails, verificationShare: e.target.checked })}
                                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-slate-600">
                                        I verify that this is a valid document and I consent to share it with the selected institution for verification purposes.
                                    </span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => setUploadModalOpen(false)}>Cancel</Button>
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUploadSubmit}>
                                    <Shield className="w-4 h-4 mr-2" /> Submit for Verification
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
