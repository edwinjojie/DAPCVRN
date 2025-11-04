export const jobsData = [
  // ============================================
  // GOOGLE JOBS (ORG-COM-001)
  // ============================================
  {
    jobId: 'JOB-001',
    title: 'Senior Software Engineer - Machine Learning',
    company: 'Google LLC',
    companyId: null, // Will be set to Google Organization ObjectId
    employerId: null, // Will be set to Jennifer Smith (USR-REC-001) ObjectId
    description: 'Join our ML team to build next-generation AI systems that impact billions of users worldwide.',
    requirements: `
- Master's degree in Computer Science or related field
- 5+ years of experience in machine learning
- Strong programming skills in Python and TensorFlow
- Experience with large-scale distributed systems
- Published research in top-tier ML conferences (preferred)
    `,
    responsibilities: `
- Design and implement ML models for production systems
- Collaborate with cross-functional teams
- Mentor junior engineers
- Contribute to ML infrastructure improvements
    `,
    location: 'Mountain View, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    salary: {
      min: 180000,
      max: 250000,
      currency: 'USD',
      period: 'yearly'
    },
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Distributed Systems'],
    requiredCredentials: ['Master of Science in Computer Science', 'Bachelor of Science in Computer Science'],
    benefits: ['Health Insurance', '401k Matching', 'Stock Options', 'Free Meals', 'Gym Membership'],
    category: 'Engineering',
    status: 'active',
    applicationDeadline: new Date('2024-03-31T23:59:59Z'),
    startDate: new Date('2024-05-01T00:00:00Z'),
    totalApplications: 0,
    viewCount: 0,
    requiresVerifiedCredentials: true
  },
  {
    jobId: 'JOB-002',
    title: 'Data Scientist - Analytics',
    company: 'Google LLC',
    companyId: null,
    employerId: null,
    description: 'Help us make data-driven decisions that shape product strategy and user experience.',
    requirements: `
- Bachelor's degree in Statistics, Mathematics, or related field
- 3+ years of experience in data analysis
- Proficiency in SQL, Python, and R
- Experience with data visualization tools (Tableau, Looker)
- Strong statistical analysis skills
    `,
    responsibilities: `
- Analyze large datasets to extract actionable insights
- Build predictive models and dashboards
- Present findings to stakeholders
- Collaborate with product teams
    `,
    location: 'Mountain View, CA',
    locationType: 'remote',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: 130000,
      max: 180000,
      currency: 'USD',
      period: 'yearly'
    },
    skills: ['Data Science', 'Python', 'SQL', 'Statistics', 'Data Visualization'],
    requiredCredentials: ['Bachelor of Arts in Data Science', 'Bachelor of Science in Computer Science'],
    benefits: ['Health Insurance', '401k Matching', 'Remote Work', 'Professional Development'],
    category: 'Data Science',
    status: 'active',
    applicationDeadline: new Date('2024-04-15T23:59:59Z'),
    startDate: new Date('2024-06-01T00:00:00Z'),
    totalApplications: 0,
    viewCount: 0,
    requiresVerifiedCredentials: true
  },

  // ============================================
  // MICROSOFT JOBS (ORG-COM-002)
  // ============================================
  {
    jobId: 'JOB-003',
    title: 'Cloud Solutions Architect',
    company: 'Microsoft Corporation',
    companyId: null,
    employerId: null, // Mark Thompson (USR-REC-002)
    description: 'Design and implement enterprise cloud solutions using Azure platform.',
    requirements: `
- Bachelor's degree in Computer Science or related field
- 5+ years of experience in cloud architecture
- Azure certifications (Solutions Architect Expert preferred)
- Strong understanding of networking and security
- Experience with infrastructure as code (Terraform, ARM templates)
    `,
    responsibilities: `
- Design scalable cloud architectures
- Lead technical discussions with clients
- Implement best practices for cloud security
- Provide technical guidance to development teams
    `,
    location: 'Redmond, WA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    salary: {
      min: 160000,
      max: 220000,
      currency: 'USD',
      period: 'yearly'
    },
    skills: ['Azure', 'Cloud Architecture', 'Networking', 'Security', 'DevOps'],
    requiredCredentials: ['AWS Certified Solutions Architect'],
    benefits: ['Health Insurance', 'Stock Purchase Plan', 'Tuition Reimbursement', 'Flexible Hours'],
    category: 'Cloud Computing',
    status: 'active',
    applicationDeadline: new Date('2024-03-25T23:59:59Z'),
    startDate: new Date('2024-05-15T00:00:00Z'),
    totalApplications: 0,
    viewCount: 0,
    requiresVerifiedCredentials: true
  },
  {
    jobId: 'JOB-004',
    title: 'Software Development Engineer - AI',
    company: 'Microsoft Corporation',
    companyId: null,
    employerId: null,
    description: 'Build cutting-edge AI features for Microsoft products.',
    requirements: `
- Master's degree in Computer Science, AI, or related field
- 3+ years of software development experience
- Strong programming skills in C#, Python, or C++
- Experience with AI/ML frameworks
- Knowledge of software design patterns
    `,
    responsibilities: `
- Develop AI-powered features
- Write clean, maintainable code
- Participate in code reviews
- Collaborate with PM and design teams
    `,
    location: 'Redmond, WA',
    locationType: 'onsite',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: 140000,
      max: 190000,
      currency: 'USD',
      period: 'yearly'
    },
    skills: ['Artificial Intelligence', 'C#', 'Python', 'Software Engineering'],
    requiredCredentials: ['Master of Science in Artificial Intelligence'],
    benefits: ['Health Insurance', 'Stock Options', 'Relocation Assistance', 'Parental Leave'],
    category: 'Engineering',
    status: 'active',
    applicationDeadline: new Date('2024-04-10T23:59:59Z'),
    startDate: new Date('2024-06-01T00:00:00Z'),
    totalApplications: 0,
    viewCount: 0,
    requiresVerifiedCredentials: true
  },

  // ============================================
  // AMAZON JOBS (ORG-COM-003)
  // ============================================
  {
    jobId: 'JOB-005',
    title: 'Full Stack Developer',
    company: 'Amazon.com Inc.',
    companyId: null,
    employerId: null, // Amanda Rodriguez (USR-REC-003)
    description: 'Build scalable web applications for Amazon retail platform.',
    requirements: `
- Bachelor's degree in Computer Science
- 2+ years of full stack development experience
- Proficiency in React, Node.js, and databases
- Experience with AWS services
- Strong problem-solving skills
    `,
    responsibilities: `
- Develop front-end and back-end features
- Optimize application performance
- Write unit and integration tests
- Participate in agile ceremonies
    `,
    location: 'Seattle, WA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: 120000,
      max: 160000,
      currency: 'USD',
      period: 'yearly'
    },
    skills: ['React', 'Node.js', 'AWS', 'JavaScript', 'MongoDB'],
    requiredCredentials: ['Full Stack Web Development'],
    benefits: ['Health Insurance', 'RSUs', 'Employee Discount', 'Career Development'],
    category: 'Web Development',
    status: 'active',
    applicationDeadline: new Date('2024-04-20T23:59:59Z'),
    startDate: new Date('2024-06-15T00:00:00Z'),
    totalApplications: 0,
    viewCount: 0,
    requiresVerifiedCredentials: false
  },
  {
    jobId: 'JOB-006',
    title: 'DevOps Engineer',
    company: 'Amazon.com Inc.',
    companyId: null,
    employerId: null,
    description: 'Manage and optimize AWS infrastructure for high-traffic applications.',
    requirements: `
- Bachelor's degree in Computer Science or related field
- 4+ years of DevOps experience
- Strong knowledge of AWS services
- Experience with CI/CD pipelines
- Proficiency in scripting (Python, Bash)
    `,
    responsibilities: `
- Maintain and improve infrastructure
- Implement monitoring and alerting
- Automate deployment processes
- Troubleshoot production issues
    `,
    location: 'Seattle, WA',
    locationType: 'onsite',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    salary: {
      min: 150000,
      max: 200000,
      currency: 'USD',
      period: 'yearly'
    },
    skills: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    requiredCredentials: [],
    benefits: ['Health Insurance', 'RSUs', '401k', 'Commuter Benefits'],
    category: 'DevOps',
    status: 'active',
    applicationDeadline: new Date('2024-03-30T23:59:59Z'),
    startDate: new Date('2024-05-20T00:00:00Z'),
    totalApplications: 0,
    viewCount: 0,
    requiresVerifiedCredentials: false
  },

  // ============================================
  // META JOBS (ORG-COM-004)
  // ============================================
  {
    jobId: 'JOB-007',
    title: 'Security Engineer',
    company: 'Meta Platforms Inc.',
    companyId: null,
    employerId: null, // Chris Lee (USR-REC-004)
    description: 'Protect Meta platforms and user data from security threats.',
    requirements: `
- Bachelor's degree in Cybersecurity or related field
- 3+ years of security engineering experience
- Knowledge of security frameworks and best practices
- Experience with penetration testing
- Security certifications (CISSP, CEH) preferred
    `,
    responsibilities: `
- Conduct security assessments
- Implement security controls
- Respond to security incidents
- Develop security policies
    `,
    location: 'Menlo Park, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: 140000,
      max: 190000,
      currency: 'USD',
      period: 'yearly'
    },
    skills: ['Cybersecurity', 'Network Security', 'Penetration Testing', 'Incident Response'],
    requiredCredentials: ['Bachelor of Science in Cybersecurity'],
    benefits: ['Health Insurance', 'RSUs', 'Free Meals', 'Wellness Programs'],
    category: 'Security',
    status: 'active',
    applicationDeadline: new Date('2024-04-05T23:59:59Z'),
    startDate: new Date('2024-06-01T00:00:00Z'),
    totalApplications: 0,
    viewCount: 0,
    requiresVerifiedCredentials: true
  },

  // ============================================
  // APPLE JOBS (ORG-COM-005)
  // ============================================
  {
    jobId: 'JOB-008',
    title: 'iOS Developer',
    company: 'Apple Inc.',
    companyId: null,
    employerId: null, // Patricia Brown (USR-REC-005)
    description: 'Create amazing experiences for millions of iOS users.',
    requirements: `
- Bachelor's degree in Computer Science
- 3+ years of iOS development experience
- Expert knowledge of Swift and iOS SDK
- Experience with SwiftUI and Combine
- Strong understanding of Apple HIG
    `,
    responsibilities: `
- Develop iOS applications
- Optimize app performance
- Collaborate with designers
- Maintain code quality
    `,
    location: 'Cupertino, CA',
    locationType: 'onsite',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: 150000,
      max: 200000,
      currency: 'USD',
      period: 'yearly'
    },
    skills: ['iOS', 'Swift', 'SwiftUI', 'Mobile Development'],
    requiredCredentials: [],
    benefits: ['Health Insurance', 'RSUs', 'Employee Discounts', 'Gym Access'],
    category: 'Mobile Development',
    status: 'active',
    applicationDeadline: new Date('2024-04-12T23:59:59Z'),
    startDate: new Date('2024-06-10T00:00:00Z'),
    totalApplications: 0,
    viewCount: 0,
    requiresVerifiedCredentials: false
  },

  // ============================================
  // CLOSED/FILLED JOBS
  // ============================================
  {
    jobId: 'JOB-009',
    title: 'Product Manager - AI',
    company: 'Google LLC',
    companyId: null,
    employerId: null,
    description: 'Lead product strategy for AI-powered features.',
    requirements: 'MBA with technical background, 5+ years PM experience',
    responsibilities: 'Define product roadmap, work with engineering teams',
    location: 'Mountain View, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    salary: {
      min: 170000,
      max: 230000,
      currency: 'USD',
      period: 'yearly'
    },
    skills: ['Product Management', 'AI', 'Strategy'],
    requiredCredentials: ['Master of Business Administration'],
    benefits: ['Health Insurance', 'Stock Options'],
    category: 'Product',
    status: 'filled',
    applicationDeadline: new Date('2024-01-15T23:59:59Z'),
    startDate: new Date('2024-03-01T00:00:00Z'),
    totalApplications: 45,
    viewCount: 320,
    requiresVerifiedCredentials: true
  }
];

