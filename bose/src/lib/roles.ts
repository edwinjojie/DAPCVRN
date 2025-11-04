<<<<<<< Updated upstream
export type RoleKey = 'candidate' | 'student' | 'employee' | 'recruiter' | 'employer' | 'institution' | 'verifier' | 'issuer' | 'university' | 'admin' | 'auditor';
=======
// BOSE has 4 core roles: student, university, recruiter, admin
export type RoleKey = 'student' | 'university' | 'recruiter' | 'admin';
>>>>>>> Stashed changes

export const ROLE_DASHBOARD_PATH: Record<RoleKey, string> = {
  student: '/dashboard/student',
<<<<<<< Updated upstream
  employee: '/dashboard/student',
  recruiter: '/dashboard/employer',
  employer: '/dashboard/employer',
  institution: '/university',
  verifier: '/university',
  issuer: '/university',
  university: '/university',
=======
  university: '/dashboard/university',
  recruiter: '/dashboard/recruiter',
>>>>>>> Stashed changes
  admin: '/dashboard/admin',
};

type SidebarLink = { name: string; href: string };

export const SIDEBAR_LINKS: Record<RoleKey, SidebarLink[]> = {
  // Student / Candidate
  student: [
    { name: 'Home', href: '/dashboard/student' },
    { name: 'Upload Creds', href: '/dashboard/student#upload' },
    { name: 'Portfolio', href: '/dashboard/student#portfolio' },
    { name: 'Share', href: '/dashboard/student#share' },
    { name: 'Recommendations', href: '/dashboard/student#reco' },
    { name: 'Analytics', href: '/dashboard/student#analytics' },
  ],

  // University / Institution
  university: [
    { name: 'Dashboard', href: '/dashboard/university' },
    { name: 'Verifications', href: '/dashboard/university/verifications' },
    { name: 'Issued Credentials', href: '/dashboard/university/issued' },
    { name: 'Bulk Upload', href: '/dashboard/university/bulk' },
    { name: 'Analytics', href: '/dashboard/university/analytics' },
  ],

  // Recruiter / Company
  recruiter: [
    { name: 'Home', href: '/dashboard/recruiter' },
    { name: 'Jobs', href: '/dashboard/recruiter/jobs' },
    { name: 'Applicants', href: '/dashboard/recruiter/applicants' },
    { name: 'Candidates', href: '/dashboard/recruiter/candidates' },
    { name: 'Messages', href: '/dashboard/recruiter/messages' },
  ],

<<<<<<< Updated upstream
  // Institution / Verifier / Issuer
  institution: [
    { name: 'Dashboard', href: '/university' },
    { name: 'Verifications', href: '/university/verification-requests' },
    { name: 'Issued Credentials', href: '/university/issued-credentials' },
    { name: 'Students', href: '/university/students' },
    { name: 'Analytics', href: '/university/analytics' },
  ],
  verifier: [
    { name: 'Dashboard', href: '/university' },
    { name: 'Verifications', href: '/university/verification-requests' },
    { name: 'Issued Credentials', href: '/university/issued-credentials' },
    { name: 'Students', href: '/university/students' },
    { name: 'Analytics', href: '/university/analytics' },
  ],
  issuer: [
    { name: 'Dashboard', href: '/university' },
    { name: 'Issue Creds', href: '/university' },
    { name: 'Issued Credentials', href: '/university/issued-credentials' },
  ],

  // University
  university: [
    { name: 'Dashboard', href: '/university' },
    { name: 'Verifications', href: '/university/verification-requests' },
    { name: 'Issued Credentials', href: '/university/issued-credentials' },
    { name: 'Students', href: '/university/students' },
    { name: 'Analytics', href: '/university/analytics' },
  ],

  // Admin & Auditor
=======
  // System Admin
>>>>>>> Stashed changes
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin' },
    { name: 'Users', href: '/dashboard/admin#users' },
    { name: 'Logs', href: '/dashboard/admin#logs' },
    { name: 'Settings', href: '/dashboard/admin#settings' },
  ],
};


