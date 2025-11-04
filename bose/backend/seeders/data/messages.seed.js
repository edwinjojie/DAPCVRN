export const messagesData = [
  // ============================================
  // CONVERSATION: Alice <-> Google Recruiter
  // ============================================
  {
    messageId: 'MSG-001',
    conversationId: 'CONV-ALICE-GOOGLE',
    senderId: null, // Will be set to Jennifer Smith (Google Recruiter) ObjectId
    senderName: 'Jennifer Smith',
    recipientId: null, // Will be set to Alice ObjectId
    recipientName: 'Alice Johnson',
    subject: 'Interview Invitation - ML Engineer Position',
    content: 'Hi Alice,\n\nThank you for applying to the Senior Software Engineer - Machine Learning position at Google. We were impressed with your background and would like to invite you for an interview.\n\nWould you be available for a video call on January 15th at 11:00 AM PST?\n\nBest regards,\nJennifer Smith\nTechnical Recruiter, Google',
    type: 'text',
    isRead: true,
    readAt: new Date('2024-01-11T15:00:00Z'),
    relatedJob: null, // Will be set to JOB-001 ObjectId
    relatedApplication: null // Will be set to APP-001 ObjectId
  },
  {
    messageId: 'MSG-002',
    conversationId: 'CONV-ALICE-GOOGLE',
    senderId: null, // Alice
    senderName: 'Alice Johnson',
    recipientId: null, // Jennifer
    recipientName: 'Jennifer Smith',
    subject: 'Re: Interview Invitation - ML Engineer Position',
    content: 'Hi Jennifer,\n\nThank you so much for the opportunity! I would be delighted to interview for the position. January 15th at 11:00 AM PST works perfectly for me.\n\nI look forward to speaking with you.\n\nBest regards,\nAlice Johnson',
    type: 'text',
    isRead: true,
    readAt: new Date('2024-01-11T16:30:00Z'),
    relatedJob: null,
    relatedApplication: null
  },
  {
    messageId: 'MSG-003',
    conversationId: 'CONV-ALICE-GOOGLE',
    senderId: null, // Jennifer
    senderName: 'Jennifer Smith',
    recipientId: null, // Alice
    recipientName: 'Alice Johnson',
    subject: 'Interview Details and Preparation',
    content: 'Hi Alice,\n\nGreat! I\'ve scheduled the interview. You\'ll receive a calendar invite shortly with the video call link.\n\nThe interview will be with John Doe, our Engineering Manager. Please prepare to discuss your ML projects and experience.\n\nLooking forward to it!\n\nBest,\nJennifer',
    type: 'text',
    isRead: true,
    readAt: new Date('2024-01-12T09:00:00Z'),
    relatedJob: null,
    relatedApplication: null
  },

  // ============================================
  // CONVERSATION: Bob <-> Microsoft Recruiter
  // ============================================
  {
    messageId: 'MSG-004',
    conversationId: 'CONV-BOB-MICROSOFT',
    senderId: null, // Mark Thompson (Microsoft Recruiter)
    senderName: 'Mark Thompson',
    recipientId: null, // Bob
    recipientName: 'Bob Smith',
    subject: 'Offer Letter - Software Development Engineer',
    content: 'Hi Bob,\n\nCongratulations! We are pleased to extend an offer for the Software Development Engineer - AI position at Microsoft.\n\nYour starting salary will be $165,000 per year, plus stock options and benefits. The offer details are attached.\n\nPlease review and let us know your decision by January 28th.\n\nBest regards,\nMark Thompson\nSenior Recruiter, Microsoft',
    type: 'text',
    isRead: true,
    readAt: new Date('2024-01-14T17:00:00Z'),
    relatedJob: null, // JOB-004
    relatedApplication: null, // APP-002
    attachments: [
      {
        filename: 'offer_letter_bob_smith.pdf',
        url: '/uploads/offers/offer_letter_bob_smith.pdf',
        fileType: 'application/pdf',
        fileSize: 245000,
        uploadedAt: new Date('2024-01-14T16:00:00Z')
      }
    ]
  },
  {
    messageId: 'MSG-005',
    conversationId: 'CONV-BOB-MICROSOFT',
    senderId: null, // Bob
    senderName: 'Bob Smith',
    recipientId: null, // Mark
    recipientName: 'Mark Thompson',
    subject: 'Re: Offer Letter - Software Development Engineer',
    content: 'Hi Mark,\n\nThank you so much for the offer! I am very excited about this opportunity. I have reviewed the offer letter and would like to accept the position.\n\nI look forward to joining the Microsoft team on March 1st.\n\nBest regards,\nBob Smith',
    type: 'text',
    isRead: true,
    readAt: new Date('2024-01-15T10:00:00Z'),
    relatedJob: null,
    relatedApplication: null
  },

  // ============================================
  // CONVERSATION: Carol <-> Google Recruiter
  // ============================================
  {
    messageId: 'MSG-006',
    conversationId: 'CONV-CAROL-GOOGLE',
    senderId: null, // Jennifer Smith
    senderName: 'Jennifer Smith',
    recipientId: null, // Carol
    recipientName: 'Carol White',
    subject: 'Phone Screen Scheduled',
    content: 'Hi Carol,\n\nThank you for your interest in the Data Scientist position at Google. We would like to schedule a phone screen with you.\n\nMike Chen, our Data Science Lead, will call you on January 18th at 10:00 AM PST.\n\nPlease confirm your availability.\n\nBest,\nJennifer',
    type: 'text',
    isRead: false,
    relatedJob: null, // JOB-002
    relatedApplication: null // APP-003
  },

  // ============================================
  // CONVERSATION: Grace <-> Meta Recruiter
  // ============================================
  {
    messageId: 'MSG-007',
    conversationId: 'CONV-GRACE-META',
    senderId: null, // Chris Lee (Meta Recruiter)
    senderName: 'Chris Lee',
    recipientId: null, // Grace
    recipientName: 'Grace Wilson',
    subject: 'Next Steps - Security Engineer Position',
    content: 'Hi Grace,\n\nThank you for the great interview! We were impressed with your cybersecurity knowledge and problem-solving skills.\n\nThe next step is a technical assessment. You\'ll receive a link to complete it within the next 48 hours.\n\nBest regards,\nChris Lee\nTechnical Recruiter, Meta',
    type: 'text',
    isRead: true,
    readAt: new Date('2024-01-16T16:00:00Z'),
    relatedJob: null, // JOB-007
    relatedApplication: null // APP-005
  },

  // ============================================
  // SYSTEM MESSAGES
  // ============================================
  {
    messageId: 'MSG-008',
    conversationId: 'SYSTEM-ALICE-001',
    senderId: null, // System Admin
    senderName: 'BOSE System',
    recipientId: null, // Alice
    recipientName: 'Alice Johnson',
    subject: 'Credential Verified',
    content: 'Your credential "Bachelor of Science in Computer Science" has been verified by Massachusetts Institute of Technology and recorded on the blockchain.\n\nTransaction ID: TX-CRED-001-BC-2023',
    type: 'system',
    isRead: true,
    readAt: new Date('2023-05-20T15:00:00Z'),
    relatedCredential: null // CRED-001
  },
  {
    messageId: 'MSG-009',
    conversationId: 'SYSTEM-BOB-001',
    senderId: null, // System Admin
    senderName: 'BOSE System',
    recipientId: null, // Bob
    recipientName: 'Bob Smith',
    subject: 'Application Status Update',
    content: 'Your application for "Software Development Engineer - AI" at Microsoft Corporation has been updated to: OFFERED\n\nPlease check your messages for details.',
    type: 'system',
    isRead: true,
    readAt: new Date('2024-01-14T16:30:00Z'),
    relatedApplication: null // APP-002
  },

  // ============================================
  // UNREAD MESSAGES
  // ============================================
  {
    messageId: 'MSG-010',
    conversationId: 'CONV-ALICE-GOOGLE-2',
    senderId: null, // Jennifer
    senderName: 'Jennifer Smith',
    recipientId: null, // Alice
    recipientName: 'Alice Johnson',
    subject: 'Technical Interview Scheduled',
    content: 'Hi Alice,\n\nFollowing your successful first interview, we would like to schedule a technical interview with Jane Smith, our Senior ML Engineer.\n\nThe interview is scheduled for January 20th at 2:00 PM PST. You\'ll receive a calendar invite with the details.\n\nBest,\nJennifer',
    type: 'text',
    isRead: false,
    relatedJob: null,
    relatedApplication: null
  }
];

