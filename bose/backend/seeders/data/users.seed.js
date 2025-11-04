// Password: "password123" for all demo users
// NOTE: Password will be hashed by the User model's pre-save hook
const plainPassword = 'password123';

export const usersData = [
  // ============================================
  // SYSTEM ADMINISTRATORS
  // ============================================
  {
    userId: 'USR-ADMIN-001',
    name: 'System Administrator',
    email: 'admin@bose.edu',
    password: plainPassword,
    role: 'admin',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-15T10:00:00Z')
  },
  {
    userId: 'USR-ADMIN-002',
    name: 'Sarah Johnson',
    email: 'sarah.admin@bose.edu',
    role: 'admin',
    password: plainPassword,
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-14T15:30:00Z')
  },

  // ============================================
  // UNIVERSITIES / INSTITUTIONS
  // ============================================
  {
    userId: 'USR-UNI-001',
    name: 'Dr. Robert Williams',
    email: 'registrar@mit.edu',
    password: plainPassword,
    role: 'university',
    organizationId: null, // Will be linked after Organization creation
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-15T08:00:00Z')
  },
  {
    userId: 'USR-UNI-002',
    name: 'Prof. Emily Davis',
    email: 'admin@stanford.edu',
    password: plainPassword,
    role: 'university',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-14T14:00:00Z')
  },
  {
    userId: 'USR-UNI-003',
    name: 'Dr. James Anderson',
    email: 'credentials@harvard.edu',
    password: plainPassword,
    role: 'university',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-13T11:00:00Z')
  },
  {
    userId: 'USR-UNI-004',
    name: 'Dr. Lisa Martinez',
    email: 'registrar@berkeley.edu',
    password: plainPassword,
    role: 'university',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-12T10:00:00Z')
  },
  {
    userId: 'USR-UNI-005',
    name: 'Prof. David Kumar',
    email: 'admin@iitdelhi.ac.in',
    password: plainPassword,
    role: 'university',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-11T09:00:00Z')
  },

  // ============================================
  // RECRUITERS / COMPANIES
  // ============================================
  {
    userId: 'USR-REC-001',
    name: 'Jennifer Smith',
    email: 'hr@google.com',
    password: plainPassword,
    role: 'recruiter',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-15T09:30:00Z')
  },
  {
    userId: 'USR-REC-002',
    name: 'Mark Thompson',
    email: 'recruiting@microsoft.com',
    password: plainPassword,
    role: 'recruiter',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-15T07:00:00Z')
  },
  {
    userId: 'USR-REC-003',
    name: 'Amanda Rodriguez',
    email: 'talent@amazon.com',
    password: plainPassword,
    role: 'recruiter',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-14T16:00:00Z')
  },
  {
    userId: 'USR-REC-004',
    name: 'Chris Lee',
    email: 'hr@meta.com',
    password: plainPassword,
    role: 'recruiter',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-14T13:00:00Z')
  },
  {
    userId: 'USR-REC-005',
    name: 'Patricia Brown',
    email: 'recruiting@apple.com',
    password: plainPassword,
    role: 'recruiter',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-13T10:00:00Z')
  },

  // ============================================
  // STUDENTS / CANDIDATES
  // ============================================
  {
    userId: 'USR-STU-001',
    name: 'Alice Johnson',
    email: 'alice.johnson@student.edu',
    password: plainPassword,
    role: 'student',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-15T12:00:00Z')
  },
  {
    userId: 'USR-STU-002',
    name: 'Bob Smith',
    email: 'bob.smith@student.edu',
    password: plainPassword,
    role: 'student',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-15T11:30:00Z')
  },
  {
    userId: 'USR-STU-003',
    name: 'Carol White',
    email: 'carol.white@student.edu',
    password: plainPassword,
    role: 'student',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-15T10:45:00Z')
  },
  {
    userId: 'USR-STU-004',
    name: 'David Brown',
    email: 'david.brown@student.edu',
    password: plainPassword,
    role: 'student',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-14T18:00:00Z')
  },
  {
    userId: 'USR-STU-005',
    name: 'Emma Davis',
    email: 'emma.davis@student.edu',
    password: plainPassword,
    role: 'student',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-14T17:30:00Z')
  },
  {
    userId: 'USR-STU-006',
    name: 'Frank Miller',
    email: 'frank.miller@student.edu',
    password: plainPassword,
    role: 'student',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-14T16:15:00Z')
  },
  {
    userId: 'USR-STU-007',
    name: 'Grace Wilson',
    email: 'grace.wilson@student.edu',
    password: plainPassword,
    role: 'student',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-14T15:00:00Z')
  },
  {
    userId: 'USR-STU-008',
    name: 'Henry Taylor',
    email: 'henry.taylor@student.edu',
    password: plainPassword,
    role: 'student',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-14T14:30:00Z')
  },
  {
    userId: 'USR-STU-009',
    name: 'Ivy Anderson',
    email: 'ivy.anderson@student.edu',
    password: plainPassword,
    role: 'student',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-14T13:45:00Z')
  },
  {
    userId: 'USR-STU-010',
    name: 'Jack Thomas',
    email: 'jack.thomas@student.edu',
    password: plainPassword,
    role: 'student',
    organizationId: null,
    verified: true,
    isActive: true,
    lastLogin: new Date('2024-01-14T12:00:00Z')
  }
];

