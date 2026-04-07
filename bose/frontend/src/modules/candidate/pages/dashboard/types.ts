

export type DashboardSection = 'dashboard' | 'upload' | 'portfolio' | 'share' | 'recommendations' | 'analytics' | 'messages';

export interface CertificateItem {
    id: string;
    name: string;
    fileName?: string;
    status: 'pending' | 'verified' | 'rejected' | 'revoked';
    uploadedAt: string;
    verifiedBy?: string;
    verifiedAt?: string;
    type?: string;
    institution?: string;
    grade?: string;
    issueDate?: string;
    skills?: string[];
    description?: string;
    // Blockchain fields
    blockchainTxId?: string | null;
    blockchainTimestamp?: string | null;
    dataHash?: string;
    credentialId?: string;
    attachments?: { filename: string; url: string; uploadedAt: string }[];
}

export interface SkillBadge {
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: string;
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
}

export interface JobHistory {
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    skills: string[];
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
}
