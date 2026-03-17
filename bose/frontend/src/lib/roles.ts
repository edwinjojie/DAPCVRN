export type RoleKey =
  | 'candidate'
  | 'student'
  | 'employee'
  | 'recruiter'
  | 'employer'
  | 'institution'
  | 'university'
  | 'verifier'
  | 'issuer'
  | 'admin'
  | 'auditor';

export const ROLE_DASHBOARD_PATH: Record<RoleKey, string> = {
  candidate: '/dashboard/candidate',
  student: '/dashboard/student',
  employee: '/dashboard/student',
  recruiter: '/dashboard/employer',
  employer: '/dashboard/employer',
  institution: '/university',
  university: '/university',
  verifier: '/university',
  issuer: '/university',
  admin: '/dashboard/admin',
  auditor: '/dashboard/auditor',
};

type SidebarLink = { name: string; href: string };

export const SIDEBAR_LINKS: Record<RoleKey, SidebarLink[]> = {
  // Candidate-centric
  candidate: [
    { name: 'Dashboard', href: '/dashboard/candidate' },
    { name: 'Profile', href: '/dashboard/candidate/profile' },
    { name: 'Credentials', href: '/dashboard/candidate#credentials' },
    { name: 'Applications', href: '/dashboard/candidate#applications' },
    { name: 'Messages', href: '/dashboard/candidate#messages' },
  ],

  student: [
    { name: 'Home', href: '/dashboard/student' },
    { name: 'Upload Creds', href: '/dashboard/student#upload' },
    { name: 'Portfolio', href: '/dashboard/student#portfolio' },
    { name: 'Share', href: '/dashboard/student#share' },
    { name: 'Recommendations', href: '/dashboard/student#reco' },
    { name: 'Analytics', href: '/dashboard/student#analytics' },
  ],

  employee: [
    { name: 'Home', href: '/dashboard/student' },
    { name: 'Portfolio', href: '/dashboard/student#portfolio' },
    { name: 'Analytics', href: '/dashboard/student#analytics' },
  ],

  // Recruiter / Employer
  recruiter: [
    { name: 'Home', href: '/dashboard/employer' },
    { name: 'Jobs', href: '/dashboard/employer/jobs' },
    { name: 'Applicants', href: '/dashboard/employer/applicants' },
    { name: 'Candidates', href: '/dashboard/employer/candidates' },
    { name: 'Messages', href: '/dashboard/employer/messages' },
  ],
  employer: [
    { name: 'Home', href: '/dashboard/employer' },
    { name: 'Jobs', href: '/dashboard/employer/jobs' },
    { name: 'Applicants', href: '/dashboard/employer/applicants' },
    { name: 'Candidates', href: '/dashboard/employer/candidates' },
    { name: 'Messages', href: '/dashboard/employer/messages' },
  ],

  // Institution / Verifier / Issuer / University (all consolidated to /university)
  institution: [
    { name: 'Dashboard', href: '/university' },
    { name: 'Verifications', href: '/university/verification-requests' },
    { name: 'Issue Credential', href: '/university/issue-credential' },
    { name: 'Issued Credentials', href: '/university/issued-credentials' },
    { name: 'Analytics', href: '/university/analytics' },
  ],
  verifier: [
    { name: 'Dashboard', href: '/university' },
    { name: 'Verifications', href: '/university/verification-requests' },
    { name: 'Issued Credentials', href: '/university/issued-credentials' },
  ],
  issuer: [
    { name: 'Dashboard', href: '/university' },
    { name: 'Issue Credential', href: '/university/issue-credential' },
    { name: 'Issued Credentials', href: '/university/issued-credentials' },
  ],
  university: [
    { name: 'Dashboard', href: '/university' },
    { name: 'Verifications', href: '/university/verification-requests' },
    { name: 'Issue Credential', href: '/university/issue-credential' },
    { name: 'Issued Credentials', href: '/university/issued-credentials' },
    { name: 'Students', href: '/university/students' },
    { name: 'Analytics', href: '/university/analytics' },
  ],

  // Admin & Auditor
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin' },
    { name: 'User Management', href: '/dashboard/admin/users' },
    { name: 'Credentials', href: '/dashboard/admin/credentials' },
    { name: 'Analytics', href: '/dashboard/admin/analytics' },
  ],
  auditor: [
    { name: 'Dashboard', href: '/dashboard/auditor' },
    { name: 'Reports', href: '/dashboard/auditor#reports' },
    { name: 'Logs', href: '/dashboard/auditor#logs' },
  ],
};


