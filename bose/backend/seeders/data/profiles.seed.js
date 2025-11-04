export const profilesData = [
  // ============================================
  // ALICE JOHNSON'S PROFILE (USR-STU-001)
  // ============================================
  {
    userId: null, // Will be set to Alice ObjectId
    firstName: 'Alice',
    lastName: 'Johnson',
    dateOfBirth: new Date('2000-03-15'),
    gender: 'female',
    nationality: 'United States',
    phone: '+1-555-0101',
    alternateEmail: 'alice.j.personal@gmail.com',
    address: {
      street: '123 Main Street',
      city: 'Cambridge',
      state: 'Massachusetts',
      country: 'United States',
      zipCode: '02139'
    },
    headline: 'Machine Learning Engineer | MIT Graduate',
    bio: 'Passionate about AI and machine learning. Recent MIT graduate with hands-on experience in building ML models and deploying them at scale.',
    currentPosition: 'ML Research Assistant',
    currentCompany: 'MIT AI Lab',
    yearsOfExperience: 1,
    skills: [
      { name: 'Python', level: 'expert', yearsOfExperience: 4, verified: true },
      { name: 'Machine Learning', level: 'advanced', yearsOfExperience: 3, verified: true },
      { name: 'TensorFlow', level: 'advanced', yearsOfExperience: 2, verified: false },
      { name: 'Deep Learning', level: 'advanced', yearsOfExperience: 2, verified: true },
      { name: 'Data Structures', level: 'expert', yearsOfExperience: 4, verified: true }
    ],
    education: [
      {
        institution: 'Massachusetts Institute of Technology',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2019-09-01'),
        endDate: new Date('2023-05-15'),
        grade: '3.9 GPA',
        description: 'Focused on AI and Machine Learning. Completed honors thesis on neural network optimization.',
        current: false
      }
    ],
    experience: [
      {
        company: 'MIT AI Lab',
        position: 'ML Research Assistant',
        location: 'Cambridge, MA',
        startDate: new Date('2023-06-01'),
        endDate: null,
        current: true,
        description: 'Working on cutting-edge ML research projects',
        achievements: [
          'Published paper on neural network optimization',
          'Developed ML model with 95% accuracy'
        ]
      },
      {
        company: 'Google',
        position: 'Software Engineering Intern',
        location: 'Mountain View, CA',
        startDate: new Date('2022-06-01'),
        endDate: new Date('2022-08-31'),
        current: false,
        description: 'Worked on ML infrastructure team',
        achievements: [
          'Improved model training pipeline efficiency by 30%'
        ]
      }
    ],
    certifications: [
      {
        name: 'Machine Learning Specialization',
        issuer: 'MIT',
        issueDate: new Date('2023-08-10'),
        credentialId: 'CRED-002'
      }
    ],
    projects: [
      {
        title: 'Image Classification System',
        description: 'Built a CNN-based image classifier with 98% accuracy',
        url: 'https://github.com/alice/image-classifier',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-05-01'),
        technologies: ['Python', 'TensorFlow', 'Keras'],
        current: false
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/alicejohnson',
      github: 'https://github.com/alicejohnson',
      portfolio: 'https://alicejohnson.dev'
    },
    preferences: {
      jobType: ['full-time'],
      workLocation: ['hybrid', 'remote'],
      desiredSalary: {
        min: 120000,
        max: 180000,
        currency: 'USD'
      },
      willingToRelocate: true,
      availableFrom: new Date('2024-03-01')
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true
    },
    resume: {
      filename: 'alice_johnson_resume.pdf',
      url: '/uploads/resumes/alice_johnson_resume.pdf',
      uploadedAt: new Date('2024-01-10T10:00:00Z')
    }
  },

  // ============================================
  // BOB SMITH'S PROFILE (USR-STU-002)
  // ============================================
  {
    userId: null, // Bob
    firstName: 'Bob',
    lastName: 'Smith',
    dateOfBirth: new Date('1998-07-22'),
    gender: 'male',
    nationality: 'United States',
    phone: '+1-555-0102',
    address: {
      street: '456 University Ave',
      city: 'Stanford',
      state: 'California',
      country: 'United States',
      zipCode: '94305'
    },
    headline: 'AI Engineer | Stanford MS Graduate | AWS Certified',
    bio: 'Experienced AI engineer with expertise in deep learning and cloud architecture. Passionate about building scalable AI systems.',
    currentPosition: 'AI Engineer',
    currentCompany: 'Startup Inc',
    yearsOfExperience: 3,
    skills: [
      { name: 'Artificial Intelligence', level: 'expert', yearsOfExperience: 4, verified: true },
      { name: 'Python', level: 'expert', yearsOfExperience: 5, verified: true },
      { name: 'AWS', level: 'advanced', yearsOfExperience: 2, verified: true },
      { name: 'Computer Vision', level: 'advanced', yearsOfExperience: 3, verified: true },
      { name: 'NLP', level: 'intermediate', yearsOfExperience: 2, verified: false }
    ],
    education: [
      {
        institution: 'Stanford University',
        degree: 'Master of Science',
        fieldOfStudy: 'Artificial Intelligence',
        startDate: new Date('2021-09-01'),
        endDate: new Date('2023-06-20'),
        grade: '3.85 GPA',
        description: 'Specialized in computer vision and NLP',
        current: false
      },
      {
        institution: 'UC Berkeley',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2017-09-01'),
        endDate: new Date('2021-05-15'),
        grade: '3.7 GPA',
        current: false
      }
    ],
    experience: [
      {
        company: 'Startup Inc',
        position: 'AI Engineer',
        location: 'San Francisco, CA',
        startDate: new Date('2023-07-01'),
        endDate: null,
        current: true,
        description: 'Building AI-powered products',
        achievements: [
          'Led development of computer vision system',
          'Reduced inference latency by 50%'
        ]
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2023-09-01'),
        expiryDate: new Date('2026-09-01'),
        credentialId: 'CRED-004'
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/bobsmith',
      github: 'https://github.com/bobsmith'
    },
    preferences: {
      jobType: ['full-time'],
      workLocation: ['hybrid'],
      desiredSalary: {
        min: 150000,
        max: 200000,
        currency: 'USD'
      },
      willingToRelocate: false,
      availableFrom: new Date('2024-02-15')
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: true,
      showPhone: false,
      allowMessages: true
    }
  },

  // ============================================
  // CAROL WHITE'S PROFILE (USR-STU-003)
  // ============================================
  {
    userId: null, // Carol
    firstName: 'Carol',
    lastName: 'White',
    dateOfBirth: new Date('2001-11-08'),
    gender: 'female',
    nationality: 'United States',
    phone: '+1-555-0103',
    address: {
      city: 'Cambridge',
      state: 'Massachusetts',
      country: 'United States'
    },
    headline: 'Data Scientist | Harvard Graduate',
    bio: 'Data scientist passionate about using analytics to solve real-world problems.',
    yearsOfExperience: 1,
    skills: [
      { name: 'Data Science', level: 'advanced', yearsOfExperience: 2, verified: true },
      { name: 'Python', level: 'advanced', yearsOfExperience: 3, verified: true },
      { name: 'R', level: 'intermediate', yearsOfExperience: 2, verified: false },
      { name: 'SQL', level: 'advanced', yearsOfExperience: 2, verified: false },
      { name: 'Data Visualization', level: 'advanced', yearsOfExperience: 2, verified: false }
    ],
    education: [
      {
        institution: 'Harvard University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Data Science',
        startDate: new Date('2019-09-01'),
        endDate: new Date('2023-05-25'),
        grade: '3.75 GPA',
        current: false
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/carolwhite'
    },
    preferences: {
      jobType: ['full-time', 'contract'],
      workLocation: ['remote'],
      desiredSalary: {
        min: 100000,
        max: 140000,
        currency: 'USD'
      },
      willingToRelocate: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true
    }
  },

  // ============================================
  // GRACE WILSON'S PROFILE (USR-STU-007)
  // ============================================
  {
    userId: null, // Grace
    firstName: 'Grace',
    lastName: 'Wilson',
    dateOfBirth: new Date('2000-05-30'),
    gender: 'female',
    nationality: 'United States',
    phone: '+1-555-0107',
    address: {
      city: 'Palo Alto',
      state: 'California',
      country: 'United States'
    },
    headline: 'Cybersecurity Specialist | Stanford Graduate | CEH Certified',
    bio: 'Cybersecurity professional dedicated to protecting digital assets and ensuring data privacy.',
    yearsOfExperience: 1,
    skills: [
      { name: 'Cybersecurity', level: 'advanced', yearsOfExperience: 2, verified: true },
      { name: 'Network Security', level: 'advanced', yearsOfExperience: 2, verified: true },
      { name: 'Penetration Testing', level: 'intermediate', yearsOfExperience: 1, verified: false },
      { name: 'Cryptography', level: 'advanced', yearsOfExperience: 2, verified: true }
    ],
    education: [
      {
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Cybersecurity',
        startDate: new Date('2019-09-01'),
        endDate: new Date('2023-05-22'),
        grade: '3.88 GPA',
        current: false
      }
    ],
    certifications: [
      {
        name: 'Certified Ethical Hacker (CEH)',
        issuer: 'EC-Council',
        issueDate: new Date('2023-07-01')
      },
      {
        name: 'CompTIA Security+',
        issuer: 'CompTIA',
        issueDate: new Date('2023-03-15')
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/gracewilson'
    },
    preferences: {
      jobType: ['full-time'],
      workLocation: ['hybrid', 'onsite'],
      desiredSalary: {
        min: 110000,
        max: 150000,
        currency: 'USD'
      },
      willingToRelocate: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true
    }
  }
];

