export const notificationsData = [
  // ============================================
  // ALICE'S NOTIFICATIONS
  // ============================================
  {
    notificationId: 'NOTIF-001',
    userId: null, // Will be set to Alice ObjectId
    type: 'credential_verified',
    title: 'Credential Verified',
    message: 'Your "Bachelor of Science in Computer Science" credential has been verified by MIT and recorded on the blockchain.',
    priority: 'high',
    relatedCredential: null, // CRED-001
    actionUrl: '/credentials/CRED-001',
    actionText: 'View Credential',
    isRead: true,
    readAt: new Date('2023-05-20T15:00:00Z'),
    deliveryMethod: 'in-app',
    emailSent: true,
    emailSentAt: new Date('2023-05-20T14:30:00Z')
  },
  {
    notificationId: 'NOTIF-002',
    userId: null, // Alice
    type: 'application_status_changed',
    title: 'Application Status Updated',
    message: 'Your application for "Senior Software Engineer - ML" at Google has been moved to "Under Review".',
    priority: 'medium',
    relatedJob: null, // JOB-001
    relatedApplication: null, // APP-001
    actionUrl: '/applications/APP-001',
    actionText: 'View Application',
    isRead: true,
    readAt: new Date('2024-01-11T14:30:00Z'),
    deliveryMethod: 'in-app'
  },
  {
    notificationId: 'NOTIF-003',
    userId: null, // Alice
    type: 'message_received',
    title: 'New Message from Jennifer Smith',
    message: 'You have received a new message regarding your application at Google.',
    priority: 'medium',
    relatedUser: null, // Jennifer Smith
    actionUrl: '/messages/MSG-001',
    actionText: 'Read Message',
    isRead: true,
    readAt: new Date('2024-01-11T15:00:00Z'),
    deliveryMethod: 'in-app'
  },
  {
    notificationId: 'NOTIF-004',
    userId: null, // Alice
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: 'Your interview for "Senior Software Engineer - ML" at Google is scheduled for January 15, 2024 at 11:00 AM PST.',
    priority: 'high',
    relatedJob: null,
    relatedApplication: null,
    actionUrl: '/applications/APP-001',
    actionText: 'View Details',
    isRead: true,
    readAt: new Date('2024-01-12T09:30:00Z'),
    deliveryMethod: 'in-app',
    emailSent: true,
    emailSentAt: new Date('2024-01-12T09:00:00Z')
  },
  {
    notificationId: 'NOTIF-005',
    userId: null, // Alice
    type: 'message_received',
    title: 'New Message: Technical Interview Scheduled',
    message: 'Jennifer Smith sent you a message about your technical interview.',
    priority: 'high',
    actionUrl: '/messages/MSG-010',
    actionText: 'Read Message',
    isRead: false,
    deliveryMethod: 'in-app'
  },

  // ============================================
  // BOB'S NOTIFICATIONS
  // ============================================
  {
    notificationId: 'NOTIF-006',
    userId: null, // Bob
    type: 'credential_verified',
    title: 'Credential Verified',
    message: 'Your "Master of Science in Artificial Intelligence" credential has been verified by Stanford University.',
    priority: 'high',
    relatedCredential: null, // CRED-003
    actionUrl: '/credentials/CRED-003',
    actionText: 'View Credential',
    isRead: true,
    readAt: new Date('2023-06-25T12:00:00Z'),
    deliveryMethod: 'in-app',
    emailSent: true,
    emailSentAt: new Date('2023-06-25T11:00:00Z')
  },
  {
    notificationId: 'NOTIF-007',
    userId: null, // Bob
    type: 'application_status_changed',
    title: 'Application Shortlisted',
    message: 'Great news! Your application for "Software Development Engineer - AI" at Microsoft has been shortlisted.',
    priority: 'high',
    relatedJob: null, // JOB-004
    relatedApplication: null, // APP-002
    actionUrl: '/applications/APP-002',
    actionText: 'View Application',
    isRead: true,
    readAt: new Date('2024-01-10T11:30:00Z'),
    deliveryMethod: 'in-app'
  },
  {
    notificationId: 'NOTIF-008',
    userId: null, // Bob
    type: 'offer_received',
    title: 'Job Offer Received!',
    message: 'Congratulations! Microsoft has extended an offer for the "Software Development Engineer - AI" position.',
    priority: 'urgent',
    relatedJob: null,
    relatedApplication: null,
    actionUrl: '/applications/APP-002',
    actionText: 'View Offer',
    isRead: true,
    readAt: new Date('2024-01-14T17:00:00Z'),
    deliveryMethod: 'in-app',
    emailSent: true,
    emailSentAt: new Date('2024-01-14T16:00:00Z')
  },

  // ============================================
  // CAROL'S NOTIFICATIONS
  // ============================================
  {
    notificationId: 'NOTIF-009',
    userId: null, // Carol
    type: 'application_status_changed',
    title: 'Application Shortlisted',
    message: 'Your application for "Data Scientist - Analytics" at Google has been shortlisted for a phone screen.',
    priority: 'high',
    relatedJob: null, // JOB-002
    relatedApplication: null, // APP-003
    actionUrl: '/applications/APP-003',
    actionText: 'View Application',
    isRead: true,
    readAt: new Date('2024-01-14T15:30:00Z'),
    deliveryMethod: 'in-app'
  },
  {
    notificationId: 'NOTIF-010',
    userId: null, // Carol
    type: 'message_received',
    title: 'New Message from Google',
    message: 'Jennifer Smith sent you a message about scheduling a phone screen.',
    priority: 'medium',
    actionUrl: '/messages/MSG-006',
    actionText: 'Read Message',
    isRead: false,
    deliveryMethod: 'in-app'
  },

  // ============================================
  // GRACE'S NOTIFICATIONS
  // ============================================
  {
    notificationId: 'NOTIF-011',
    userId: null, // Grace
    type: 'credential_verified',
    title: 'Credential Verified',
    message: 'Your "Bachelor of Science in Cybersecurity" credential has been verified by Stanford University.',
    priority: 'high',
    relatedCredential: null, // CRED-010
    actionUrl: '/credentials/CRED-010',
    actionText: 'View Credential',
    isRead: true,
    readAt: new Date('2023-05-27T12:00:00Z'),
    deliveryMethod: 'in-app'
  },
  {
    notificationId: 'NOTIF-012',
    userId: null, // Grace
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: 'Your interview for "Security Engineer" at Meta is scheduled for January 16, 2024 at 2:00 PM PST.',
    priority: 'high',
    relatedJob: null, // JOB-007
    relatedApplication: null, // APP-005
    actionUrl: '/applications/APP-005',
    actionText: 'View Details',
    isRead: true,
    readAt: new Date('2024-01-14T11:00:00Z'),
    deliveryMethod: 'in-app',
    emailSent: true,
    emailSentAt: new Date('2024-01-14T10:00:00Z')
  },
  {
    notificationId: 'NOTIF-013',
    userId: null, // Grace
    type: 'message_received',
    title: 'Next Steps - Technical Assessment',
    message: 'Chris Lee sent you a message about the next steps in your application process.',
    priority: 'high',
    actionUrl: '/messages/MSG-007',
    actionText: 'Read Message',
    isRead: true,
    readAt: new Date('2024-01-16T16:00:00Z'),
    deliveryMethod: 'in-app'
  },

  // ============================================
  // EMMA'S NOTIFICATIONS (Rejected)
  // ============================================
  {
    notificationId: 'NOTIF-014',
    userId: null, // Emma (USR-STU-005)
    type: 'application_status_changed',
    title: 'Application Status Update',
    message: 'Thank you for your interest in the "Cloud Solutions Architect" position at Microsoft. Unfortunately, we have decided to move forward with other candidates.',
    priority: 'medium',
    relatedJob: null, // JOB-003
    relatedApplication: null, // APP-006
    actionUrl: '/applications/APP-006',
    actionText: 'View Application',
    isRead: false,
    deliveryMethod: 'in-app',
    emailSent: true,
    emailSentAt: new Date('2024-01-09T15:00:00Z')
  },

  // ============================================
  // RECRUITER NOTIFICATIONS
  // ============================================
  {
    notificationId: 'NOTIF-015',
    userId: null, // Jennifer Smith (Google Recruiter)
    type: 'application_received',
    title: 'New Application Received',
    message: 'Alice Johnson has applied for "Senior Software Engineer - ML" position.',
    priority: 'medium',
    relatedJob: null, // JOB-001
    relatedApplication: null, // APP-001
    actionUrl: '/applications/APP-001',
    actionText: 'Review Application',
    isRead: true,
    readAt: new Date('2024-01-10T10:30:00Z'),
    deliveryMethod: 'in-app'
  },
  {
    notificationId: 'NOTIF-016',
    userId: null, // Mark Thompson (Microsoft Recruiter)
    type: 'application_received',
    title: 'New Application Received',
    message: 'Bob Smith has applied for "Software Development Engineer - AI" position.',
    priority: 'medium',
    relatedJob: null, // JOB-004
    relatedApplication: null, // APP-002
    actionUrl: '/applications/APP-002',
    actionText: 'Review Application',
    isRead: true,
    readAt: new Date('2024-01-08T15:30:00Z'),
    deliveryMethod: 'in-app'
  },

  // ============================================
  // SYSTEM NOTIFICATIONS
  // ============================================
  {
    notificationId: 'NOTIF-017',
    userId: null, // System Admin
    type: 'system',
    title: 'System Maintenance Scheduled',
    message: 'BOSE platform will undergo scheduled maintenance on January 25, 2024 from 2:00 AM to 4:00 AM UTC.',
    priority: 'low',
    actionUrl: '/system/maintenance',
    actionText: 'Learn More',
    isRead: false,
    deliveryMethod: 'in-app'
  },

  // ============================================
  // INSTITUTION NOTIFICATIONS
  // ============================================
  {
    notificationId: 'NOTIF-018',
    userId: null, // Dr. Robert Williams (MIT)
    type: 'credential_issued',
    title: 'Credential Issued Successfully',
    message: 'Credential "Bachelor of Science in Computer Science" for Alice Johnson has been issued and recorded on blockchain.',
    priority: 'medium',
    relatedCredential: null, // CRED-001
    actionUrl: '/credentials/CRED-001',
    actionText: 'View Credential',
    isRead: true,
    readAt: new Date('2023-05-16T11:00:00Z'),
    deliveryMethod: 'in-app'
  }
];

