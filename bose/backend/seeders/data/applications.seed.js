export const applicationsData = [
  // ============================================
  // ALICE JOHNSON'S APPLICATIONS (USR-STU-001)
  // ============================================
  {
    applicationId: 'APP-001',
    jobId: null, // Will be set to JOB-001 (Google ML Engineer) ObjectId
    candidateId: null, // Will be set to Alice ObjectId
    candidateName: 'Alice Johnson',
    candidateEmail: 'alice.johnson@student.edu',
    coverLetter: 'I am excited to apply for the Senior Software Engineer - Machine Learning position at Google. With my Bachelor\'s degree in Computer Science from MIT and specialized training in Machine Learning, I am confident in my ability to contribute to your ML team.',
    resume: {
      filename: 'alice_johnson_resume.pdf',
      url: '/uploads/resumes/alice_johnson_resume.pdf',
      uploadedAt: new Date('2024-01-10T10:00:00Z')
    },
    attachedCredentials: [
      {
        credentialId: null, // Will be set to CRED-001 ObjectId
        credentialTitle: 'Bachelor of Science in Computer Science',
        verified: true
      },
      {
        credentialId: null, // Will be set to CRED-002 ObjectId
        credentialTitle: 'Machine Learning Specialization',
        verified: true
      }
    ],
    status: 'interviewed',
    timeline: [
      {
        status: 'submitted',
        timestamp: new Date('2024-01-10T10:00:00Z'),
        notes: 'Application submitted',
        updatedBy: null
      },
      {
        status: 'under-review',
        timestamp: new Date('2024-01-11T14:00:00Z'),
        notes: 'Application moved to review',
        updatedBy: null // Will be set to recruiter ObjectId
      },
      {
        status: 'shortlisted',
        timestamp: new Date('2024-01-13T09:00:00Z'),
        notes: 'Candidate shortlisted for interview',
        updatedBy: null
      },
      {
        status: 'interviewed',
        timestamp: new Date('2024-01-15T11:00:00Z'),
        notes: 'First round interview completed',
        updatedBy: null
      }
    ],
    interviews: [
      {
        scheduledAt: new Date('2024-01-15T11:00:00Z'),
        type: 'video',
        interviewer: 'John Doe - Engineering Manager',
        notes: 'Strong technical skills, good communication',
        status: 'completed'
      },
      {
        scheduledAt: new Date('2024-01-20T14:00:00Z'),
        type: 'technical',
        interviewer: 'Jane Smith - Senior ML Engineer',
        notes: '',
        status: 'scheduled'
      }
    ],
    employerNotes: 'Excellent candidate with strong ML background. Proceed to technical round.',
    rating: 4.5
  },

  // ============================================
  // BOB SMITH'S APPLICATIONS (USR-STU-002)
  // ============================================
  {
    applicationId: 'APP-002',
    jobId: null, // JOB-004 (Microsoft AI Engineer)
    candidateId: null, // Bob
    candidateName: 'Bob Smith',
    candidateEmail: 'bob.smith@student.edu',
    coverLetter: 'I am writing to express my interest in the Software Development Engineer - AI position at Microsoft. My Master\'s degree in AI from Stanford and AWS certification make me a strong fit for this role.',
    resume: {
      filename: 'bob_smith_resume.pdf',
      url: '/uploads/resumes/bob_smith_resume.pdf',
      uploadedAt: new Date('2024-01-08T15:00:00Z')
    },
    attachedCredentials: [
      {
        credentialId: null, // CRED-003
        credentialTitle: 'Master of Science in Artificial Intelligence',
        verified: true
      },
      {
        credentialId: null, // CRED-004
        credentialTitle: 'AWS Certified Solutions Architect',
        verified: true
      }
    ],
    status: 'offered',
    timeline: [
      {
        status: 'submitted',
        timestamp: new Date('2024-01-08T15:00:00Z'),
        notes: 'Application submitted'
      },
      {
        status: 'under-review',
        timestamp: new Date('2024-01-09T10:00:00Z'),
        notes: 'Under review'
      },
      {
        status: 'shortlisted',
        timestamp: new Date('2024-01-10T11:00:00Z'),
        notes: 'Shortlisted'
      },
      {
        status: 'interviewed',
        timestamp: new Date('2024-01-12T14:00:00Z'),
        notes: 'Interview completed'
      },
      {
        status: 'offered',
        timestamp: new Date('2024-01-14T16:00:00Z'),
        notes: 'Offer extended'
      }
    ],
    interviews: [
      {
        scheduledAt: new Date('2024-01-12T14:00:00Z'),
        type: 'video',
        interviewer: 'Sarah Johnson - Hiring Manager',
        notes: 'Exceptional candidate, strong AI background',
        status: 'completed'
      }
    ],
    employerNotes: 'Top candidate. Extend offer immediately.',
    rating: 5,
    offer: {
      salary: 165000,
      currency: 'USD',
      startDate: new Date('2024-03-01T00:00:00Z'),
      benefits: ['Health Insurance', 'Stock Options', 'Relocation Assistance'],
      offeredAt: new Date('2024-01-14T16:00:00Z'),
      expiresAt: new Date('2024-01-28T23:59:59Z')
    }
  },

  // ============================================
  // CAROL WHITE'S APPLICATIONS (USR-STU-003)
  // ============================================
  {
    applicationId: 'APP-003',
    jobId: null, // JOB-002 (Google Data Scientist)
    candidateId: null, // Carol
    candidateName: 'Carol White',
    candidateEmail: 'carol.white@student.edu',
    coverLetter: 'I am thrilled to apply for the Data Scientist position at Google. My degree in Data Science from Harvard has equipped me with the skills needed for this role.',
    resume: {
      filename: 'carol_white_resume.pdf',
      url: '/uploads/resumes/carol_white_resume.pdf',
      uploadedAt: new Date('2024-01-11T09:00:00Z')
    },
    attachedCredentials: [
      {
        credentialId: null, // CRED-005
        credentialTitle: 'Bachelor of Arts in Data Science',
        verified: true
      }
    ],
    status: 'shortlisted',
    timeline: [
      {
        status: 'submitted',
        timestamp: new Date('2024-01-11T09:00:00Z'),
        notes: 'Application submitted'
      },
      {
        status: 'under-review',
        timestamp: new Date('2024-01-12T10:00:00Z'),
        notes: 'Under review'
      },
      {
        status: 'shortlisted',
        timestamp: new Date('2024-01-14T15:00:00Z'),
        notes: 'Shortlisted for interview'
      }
    ],
    interviews: [
      {
        scheduledAt: new Date('2024-01-18T10:00:00Z'),
        type: 'phone',
        interviewer: 'Mike Chen - Data Science Lead',
        notes: '',
        status: 'scheduled'
      }
    ],
    employerNotes: 'Good academic background. Schedule phone screen.',
    rating: 4
  },

  // ============================================
  // DAVID BROWN'S APPLICATIONS (USR-STU-004)
  // ============================================
  {
    applicationId: 'APP-004',
    jobId: null, // JOB-006 (Amazon DevOps)
    candidateId: null, // David
    candidateName: 'David Brown',
    candidateEmail: 'david.brown@student.edu',
    coverLetter: 'I am applying for the DevOps Engineer position at Amazon. My background in Electrical Engineering and IoT systems provides a unique perspective for infrastructure management.',
    resume: {
      filename: 'david_brown_resume.pdf',
      url: '/uploads/resumes/david_brown_resume.pdf',
      uploadedAt: new Date('2024-01-09T11:00:00Z')
    },
    attachedCredentials: [
      {
        credentialId: null, // CRED-006
        credentialTitle: 'Bachelor of Science in Electrical Engineering',
        verified: true
      },
      {
        credentialId: null, // CRED-007
        credentialTitle: 'IoT Systems Design',
        verified: true
      }
    ],
    status: 'under-review',
    timeline: [
      {
        status: 'submitted',
        timestamp: new Date('2024-01-09T11:00:00Z'),
        notes: 'Application submitted'
      },
      {
        status: 'under-review',
        timestamp: new Date('2024-01-10T14:00:00Z'),
        notes: 'Application under review'
      }
    ],
    interviews: [],
    employerNotes: 'Interesting background but lacks direct DevOps experience.',
    rating: 3
  },

  // ============================================
  // GRACE WILSON'S APPLICATIONS (USR-STU-007)
  // ============================================
  {
    applicationId: 'APP-005',
    jobId: null, // JOB-007 (Meta Security Engineer)
    candidateId: null, // Grace
    candidateName: 'Grace Wilson',
    candidateEmail: 'grace.wilson@student.edu',
    coverLetter: 'I am excited to apply for the Security Engineer position at Meta. My degree in Cybersecurity from Stanford makes me an ideal candidate for this role.',
    resume: {
      filename: 'grace_wilson_resume.pdf',
      url: '/uploads/resumes/grace_wilson_resume.pdf',
      uploadedAt: new Date('2024-01-12T13:00:00Z')
    },
    attachedCredentials: [
      {
        credentialId: null, // CRED-010
        credentialTitle: 'Bachelor of Science in Cybersecurity',
        verified: true
      }
    ],
    status: 'interviewed',
    timeline: [
      {
        status: 'submitted',
        timestamp: new Date('2024-01-12T13:00:00Z'),
        notes: 'Application submitted'
      },
      {
        status: 'under-review',
        timestamp: new Date('2024-01-13T09:00:00Z'),
        notes: 'Under review'
      },
      {
        status: 'shortlisted',
        timestamp: new Date('2024-01-14T10:00:00Z'),
        notes: 'Shortlisted'
      },
      {
        status: 'interviewed',
        timestamp: new Date('2024-01-16T14:00:00Z'),
        notes: 'First interview completed'
      }
    ],
    interviews: [
      {
        scheduledAt: new Date('2024-01-16T14:00:00Z'),
        type: 'video',
        interviewer: 'Alex Martinez - Security Team Lead',
        notes: 'Strong security fundamentals, good cultural fit',
        status: 'completed'
      }
    ],
    employerNotes: 'Promising candidate. Move to technical assessment.',
    rating: 4.5
  },

  // ============================================
  // REJECTED APPLICATIONS
  // ============================================
  {
    applicationId: 'APP-006',
    jobId: null, // JOB-003 (Microsoft Cloud Architect)
    candidateId: null, // Emma (USR-STU-005)
    candidateName: 'Emma Davis',
    candidateEmail: 'emma.davis@student.edu',
    coverLetter: 'I am interested in the Cloud Solutions Architect position.',
    resume: {
      filename: 'emma_davis_resume.pdf',
      url: '/uploads/resumes/emma_davis_resume.pdf',
      uploadedAt: new Date('2024-01-07T10:00:00Z')
    },
    attachedCredentials: [
      {
        credentialId: null, // CRED-008
        credentialTitle: 'Bachelor of Technology in Computer Science',
        verified: true
      }
    ],
    status: 'rejected',
    timeline: [
      {
        status: 'submitted',
        timestamp: new Date('2024-01-07T10:00:00Z'),
        notes: 'Application submitted'
      },
      {
        status: 'under-review',
        timestamp: new Date('2024-01-08T11:00:00Z'),
        notes: 'Under review'
      },
      {
        status: 'rejected',
        timestamp: new Date('2024-01-09T15:00:00Z'),
        notes: 'Does not meet experience requirements'
      }
    ],
    interviews: [],
    employerNotes: 'Lacks required cloud architecture experience.',
    rating: 2,
    rejectionReason: 'Position requires 5+ years of cloud architecture experience. Candidate has less than 1 year.',
    rejectedAt: new Date('2024-01-09T15:00:00Z')
  },

  // ============================================
  // FRANK MILLER'S APPLICATIONS (USR-STU-006)
  // ============================================
  {
    applicationId: 'APP-007',
    jobId: null, // JOB-009 (Google Product Manager - FILLED)
    candidateId: null, // Frank
    candidateName: 'Frank Miller',
    candidateEmail: 'frank.miller@student.edu',
    coverLetter: 'I am applying for the Product Manager - AI position. My MBA from MIT with technology focus makes me a great fit.',
    resume: {
      filename: 'frank_miller_resume.pdf',
      url: '/uploads/resumes/frank_miller_resume.pdf',
      uploadedAt: new Date('2024-01-05T14:00:00Z')
    },
    attachedCredentials: [
      {
        credentialId: null, // CRED-009
        credentialTitle: 'Master of Business Administration',
        verified: true
      }
    ],
    status: 'accepted',
    timeline: [
      {
        status: 'submitted',
        timestamp: new Date('2024-01-05T14:00:00Z'),
        notes: 'Application submitted'
      },
      {
        status: 'shortlisted',
        timestamp: new Date('2024-01-06T10:00:00Z'),
        notes: 'Shortlisted'
      },
      {
        status: 'interviewed',
        timestamp: new Date('2024-01-08T15:00:00Z'),
        notes: 'Interview completed'
      },
      {
        status: 'offered',
        timestamp: new Date('2024-01-10T16:00:00Z'),
        notes: 'Offer extended'
      },
      {
        status: 'accepted',
        timestamp: new Date('2024-01-12T10:00:00Z'),
        notes: 'Offer accepted'
      }
    ],
    interviews: [
      {
        scheduledAt: new Date('2024-01-08T15:00:00Z'),
        type: 'in-person',
        interviewer: 'Multiple interviewers',
        notes: 'Excellent product sense and technical understanding',
        status: 'completed'
      }
    ],
    employerNotes: 'Perfect fit for the role. Hired!',
    rating: 5,
    offer: {
      salary: 200000,
      currency: 'USD',
      startDate: new Date('2024-03-01T00:00:00Z'),
      benefits: ['Health Insurance', 'Stock Options', 'Relocation'],
      offeredAt: new Date('2024-01-10T16:00:00Z'),
      expiresAt: new Date('2024-01-20T23:59:59Z')
    }
  }
];

