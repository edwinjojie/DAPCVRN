export const credentialsData = [
  // ============================================
  // ALICE JOHNSON'S CREDENTIALS (USR-STU-001)
  // ============================================
  {
    credentialId: 'CRED-001',
    userId: null, // Will be set to Alice's ObjectId
    issuerId: null, // Will be set to MIT's ObjectId
    institutionId: null, // Will be set to MIT Organization ObjectId
    type: 'degree',
    title: 'Bachelor of Science in Computer Science',
    description: 'Completed undergraduate degree in Computer Science with honors',
    issueDate: new Date('2023-05-15T00:00:00Z'),
    expiryDate: null,
    status: 'verified',
    skills: ['Programming', 'Algorithms', 'Data Structures', 'Software Engineering'],
    metadata: {
      gpa: '3.9',
      major: 'Computer Science',
      minor: 'Mathematics',
      honors: 'Summa Cum Laude'
    },
    blockchainTxId: 'TX-CRED-001-BC-2023',
    dataHash: 'hash_alice_bsc_cs_mit_2023',
    blockchainTimestamp: new Date('2023-05-16T10:00:00Z'),
    organization: 'MITMSP',
    verifiedBy: null, // Will be set to verifier ObjectId
    verifiedAt: new Date('2023-05-20T14:30:00Z'),
    verificationNotes: 'Verified through official MIT registrar records'
  },
  {
    credentialId: 'CRED-002',
    userId: null, // Alice
    issuerId: null, // MIT
    institutionId: null,
    type: 'certificate',
    title: 'Machine Learning Specialization',
    description: 'Completed advanced coursework in machine learning and AI',
    issueDate: new Date('2023-08-10T00:00:00Z'),
    expiryDate: null,
    status: 'verified',
    skills: ['Machine Learning', 'Deep Learning', 'Neural Networks', 'Python'],
    metadata: {
      courseCode: 'CS-ML-501',
      instructor: 'Prof. Andrew Ng',
      grade: 'A'
    },
    blockchainTxId: 'TX-CRED-002-BC-2023',
    dataHash: 'hash_alice_ml_cert_mit_2023',
    blockchainTimestamp: new Date('2023-08-11T10:00:00Z'),
    organization: 'MITMSP',
    verifiedBy: null,
    verifiedAt: new Date('2023-08-15T09:00:00Z'),
    verificationNotes: 'Certificate verified by academic department'
  },

  // ============================================
  // BOB SMITH'S CREDENTIALS (USR-STU-002)
  // ============================================
  {
    credentialId: 'CRED-003',
    userId: null, // Bob
    issuerId: null, // Stanford
    institutionId: null,
    type: 'degree',
    title: 'Master of Science in Artificial Intelligence',
    description: 'Graduate degree focusing on AI and machine learning',
    issueDate: new Date('2023-06-20T00:00:00Z'),
    expiryDate: null,
    status: 'verified',
    skills: ['Artificial Intelligence', 'Machine Learning', 'Computer Vision', 'NLP'],
    metadata: {
      gpa: '3.85',
      thesis: 'Advanced Neural Network Architectures for Computer Vision',
      advisor: 'Prof. Fei-Fei Li'
    },
    blockchainTxId: 'TX-CRED-003-BC-2023',
    dataHash: 'hash_bob_ms_ai_stanford_2023',
    blockchainTimestamp: new Date('2023-06-21T10:00:00Z'),
    organization: 'StanfordMSP',
    verifiedBy: null,
    verifiedAt: new Date('2023-06-25T11:00:00Z'),
    verificationNotes: 'Verified through Stanford registrar'
  },
  {
    credentialId: 'CRED-004',
    userId: null, // Bob
    issuerId: null, // Stanford
    institutionId: null,
    type: 'skill',
    title: 'AWS Certified Solutions Architect',
    description: 'Professional certification in cloud architecture',
    issueDate: new Date('2023-09-01T00:00:00Z'),
    expiryDate: new Date('2026-09-01T00:00:00Z'),
    status: 'verified',
    skills: ['AWS', 'Cloud Computing', 'System Architecture', 'DevOps'],
    metadata: {
      certificationId: 'AWS-SA-2023-12345',
      level: 'Professional'
    },
    blockchainTxId: 'TX-CRED-004-BC-2023',
    dataHash: 'hash_bob_aws_cert_2023',
    blockchainTimestamp: new Date('2023-09-02T10:00:00Z'),
    organization: 'StanfordMSP',
    verifiedBy: null,
    verifiedAt: new Date('2023-09-05T10:00:00Z')
  },

  // ============================================
  // CAROL WHITE'S CREDENTIALS (USR-STU-003)
  // ============================================
  {
    credentialId: 'CRED-005',
    userId: null, // Carol
    issuerId: null, // Harvard
    institutionId: null,
    type: 'degree',
    title: 'Bachelor of Arts in Data Science',
    description: 'Undergraduate degree in data science and analytics',
    issueDate: new Date('2023-05-25T00:00:00Z'),
    expiryDate: null,
    status: 'verified',
    skills: ['Data Science', 'Statistics', 'Python', 'R', 'Data Visualization'],
    metadata: {
      gpa: '3.75',
      capstoneProject: 'Predictive Analytics for Healthcare'
    },
    blockchainTxId: 'TX-CRED-005-BC-2023',
    dataHash: 'hash_carol_ba_ds_harvard_2023',
    blockchainTimestamp: new Date('2023-05-26T10:00:00Z'),
    organization: 'HarvardMSP',
    verifiedBy: null,
    verifiedAt: new Date('2023-05-30T13:00:00Z')
  },

  // ============================================
  // DAVID BROWN'S CREDENTIALS (USR-STU-004)
  // ============================================
  {
    credentialId: 'CRED-006',
    userId: null, // David
    issuerId: null, // Berkeley
    institutionId: null,
    type: 'degree',
    title: 'Bachelor of Science in Electrical Engineering',
    description: 'Undergraduate degree in electrical engineering',
    issueDate: new Date('2023-05-18T00:00:00Z'),
    expiryDate: null,
    status: 'verified',
    skills: ['Circuit Design', 'Signal Processing', 'Embedded Systems', 'MATLAB'],
    metadata: {
      gpa: '3.65',
      concentration: 'Digital Systems'
    },
    blockchainTxId: 'TX-CRED-006-BC-2023',
    dataHash: 'hash_david_bsc_ee_berkeley_2023',
    blockchainTimestamp: new Date('2023-05-19T10:00:00Z'),
    organization: 'BerkeleyMSP',
    verifiedBy: null,
    verifiedAt: new Date('2023-05-23T12:00:00Z')
  },
  {
    credentialId: 'CRED-007',
    userId: null, // David
    issuerId: null, // Berkeley
    institutionId: null,
    type: 'certificate',
    title: 'IoT Systems Design',
    description: 'Specialized certificate in Internet of Things',
    issueDate: new Date('2023-07-15T00:00:00Z'),
    expiryDate: null,
    status: 'verified',
    skills: ['IoT', 'Sensor Networks', 'Wireless Communication', 'Arduino'],
    metadata: {
      courseCode: 'EE-IOT-401'
    },
    blockchainTxId: 'TX-CRED-007-BC-2023',
    dataHash: 'hash_david_iot_cert_berkeley_2023',
    blockchainTimestamp: new Date('2023-07-16T10:00:00Z'),
    organization: 'BerkeleyMSP',
    verifiedBy: null,
    verifiedAt: new Date('2023-07-20T11:00:00Z')
  },

  // ============================================
  // EMMA DAVIS'S CREDENTIALS (USR-STU-005)
  // ============================================
  {
    credentialId: 'CRED-008',
    userId: null, // Emma
    issuerId: null, // IIT Delhi
    institutionId: null,
    type: 'degree',
    title: 'Bachelor of Technology in Computer Science',
    description: 'Undergraduate engineering degree in computer science',
    issueDate: new Date('2023-06-01T00:00:00Z'),
    expiryDate: null,
    status: 'verified',
    skills: ['Programming', 'Algorithms', 'Database Systems', 'Web Development'],
    metadata: {
      gpa: '9.2/10',
      rank: '5th in class'
    },
    blockchainTxId: 'TX-CRED-008-BC-2023',
    dataHash: 'hash_emma_btech_cs_iitd_2023',
    blockchainTimestamp: new Date('2023-06-02T10:00:00Z'),
    organization: 'IITDMSP',
    verifiedBy: null,
    verifiedAt: new Date('2023-06-06T14:00:00Z')
  },

  // ============================================
  // FRANK MILLER'S CREDENTIALS (USR-STU-006)
  // ============================================
  {
    credentialId: 'CRED-009',
    userId: null, // Frank
    issuerId: null, // MIT
    institutionId: null,
    type: 'degree',
    title: 'Master of Business Administration',
    description: 'Graduate business degree with technology focus',
    issueDate: new Date('2023-06-10T00:00:00Z'),
    expiryDate: null,
    status: 'verified',
    skills: ['Business Strategy', 'Finance', 'Marketing', 'Leadership'],
    metadata: {
      gpa: '3.7',
      concentration: 'Technology Management'
    },
    blockchainTxId: 'TX-CRED-009-BC-2023',
    dataHash: 'hash_frank_mba_mit_2023',
    blockchainTimestamp: new Date('2023-06-11T10:00:00Z'),
    organization: 'MITMSP',
    verifiedBy: null,
    verifiedAt: new Date('2023-06-15T10:00:00Z')
  },

  // ============================================
  // GRACE WILSON'S CREDENTIALS (USR-STU-007)
  // ============================================
  {
    credentialId: 'CRED-010',
    userId: null, // Grace
    issuerId: null, // Stanford
    institutionId: null,
    type: 'degree',
    title: 'Bachelor of Science in Cybersecurity',
    description: 'Undergraduate degree in cybersecurity and information assurance',
    issueDate: new Date('2023-05-22T00:00:00Z'),
    expiryDate: null,
    status: 'verified',
    skills: ['Cybersecurity', 'Network Security', 'Cryptography', 'Ethical Hacking'],
    metadata: {
      gpa: '3.88',
      certifications: ['CEH', 'Security+']
    },
    blockchainTxId: 'TX-CRED-010-BC-2023',
    dataHash: 'hash_grace_bsc_cyber_stanford_2023',
    blockchainTimestamp: new Date('2023-05-23T10:00:00Z'),
    organization: 'StanfordMSP',
    verifiedBy: null,
    verifiedAt: new Date('2023-05-27T11:00:00Z')
  },

  // ============================================
  // PENDING CREDENTIALS (Not yet verified)
  // ============================================
  {
    credentialId: 'CRED-011',
    userId: null, // Henry (USR-STU-008)
    issuerId: null, // Harvard
    institutionId: null,
    type: 'degree',
    title: 'Bachelor of Science in Software Engineering',
    description: 'Undergraduate degree in software engineering',
    issueDate: new Date('2024-01-10T00:00:00Z'),
    expiryDate: null,
    status: 'pending',
    skills: ['Software Engineering', 'Agile', 'Testing', 'DevOps'],
    metadata: {
      expectedGraduation: '2024-05-15'
    },
    blockchainTxId: null,
    dataHash: 'hash_henry_bsc_se_harvard_2024_pending', // Temporary hash for pending credential
    blockchainTimestamp: null,
    organization: 'HarvardMSP',
    verifiedBy: null,
    verifiedAt: null
  },
  {
    credentialId: 'CRED-012',
    userId: null, // Ivy (USR-STU-009)
    issuerId: null, // Berkeley
    institutionId: null,
    type: 'certificate',
    title: 'Full Stack Web Development',
    description: 'Professional certificate in full stack development',
    issueDate: new Date('2024-01-12T00:00:00Z'),
    expiryDate: null,
    status: 'pending',
    skills: ['React', 'Node.js', 'MongoDB', 'Express'],
    metadata: {
      bootcamp: 'Berkeley Coding Bootcamp'
    },
    blockchainTxId: null,
    dataHash: 'hash_ivy_fullstack_cert_berkeley_2024_pending', // Temporary hash for pending credential
    blockchainTimestamp: null,
    organization: 'BerkeleyMSP',
    verifiedBy: null,
    verifiedAt: null
  }
];

