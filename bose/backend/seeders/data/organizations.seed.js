export const organizationsData = [
  // ============================================
  // UNIVERSITIES / INSTITUTIONS
  // ============================================
  {
    organizationId: 'ORG-UNI-001',
    name: 'Massachusetts Institute of Technology',
    type: 'institution',
    mspId: 'MITMSP',
    email: 'contact@mit.edu',
    phone: '+1-617-253-1000',
    website: 'https://www.mit.edu',
    address: {
      street: '77 Massachusetts Avenue',
      city: 'Cambridge',
      state: 'Massachusetts',
      country: 'United States',
      zipCode: '02139'
    },
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg',
    description: 'A private research university in Cambridge, Massachusetts, known for its innovation in science and technology.',
    approved: true,
    approvedBy: null, // Will be set to admin ObjectId
    approvedAt: new Date('2023-12-01T10:00:00Z'),
    isActive: true,
    blockchainRegistered: true,
    blockchainTxId: 'TX-MIT-001-BC-2023',
    adminContact: {
      name: 'Dr. Robert Williams',
      email: 'registrar@mit.edu',
      phone: '+1-617-253-1001'
    },
    stats: {
      totalCredentialsIssued: 1250,
      totalMembers: 45,
      totalVerifications: 2100
    }
  },
  {
    organizationId: 'ORG-UNI-002',
    name: 'Stanford University',
    type: 'institution',
    mspId: 'StanfordMSP',
    email: 'contact@stanford.edu',
    phone: '+1-650-723-2300',
    website: 'https://www.stanford.edu',
    address: {
      street: '450 Serra Mall',
      city: 'Stanford',
      state: 'California',
      country: 'United States',
      zipCode: '94305'
    },
    logo: 'https://identity.stanford.edu/wp-content/uploads/sites/3/2020/07/block-s-right.png',
    description: 'A private research university known for its entrepreneurship and proximity to Silicon Valley.',
    approved: true,
    approvedBy: null,
    approvedAt: new Date('2023-12-02T10:00:00Z'),
    isActive: true,
    blockchainRegistered: true,
    blockchainTxId: 'TX-STAN-001-BC-2023',
    adminContact: {
      name: 'Prof. Emily Davis',
      email: 'admin@stanford.edu',
      phone: '+1-650-723-2301'
    },
    stats: {
      totalCredentialsIssued: 980,
      totalMembers: 38,
      totalVerifications: 1650
    }
  },
  {
    organizationId: 'ORG-UNI-003',
    name: 'Harvard University',
    type: 'institution',
    mspId: 'HarvardMSP',
    email: 'contact@harvard.edu',
    phone: '+1-617-495-1000',
    website: 'https://www.harvard.edu',
    address: {
      street: 'Massachusetts Hall',
      city: 'Cambridge',
      state: 'Massachusetts',
      country: 'United States',
      zipCode: '02138'
    },
    logo: 'https://upload.wikimedia.org/wikipedia/en/2/29/Harvard_shield_wreath.svg',
    description: 'The oldest institution of higher education in the United States, established in 1636.',
    approved: true,
    approvedBy: null,
    approvedAt: new Date('2023-12-03T10:00:00Z'),
    isActive: true,
    blockchainRegistered: true,
    blockchainTxId: 'TX-HARV-001-BC-2023',
    adminContact: {
      name: 'Dr. James Anderson',
      email: 'credentials@harvard.edu',
      phone: '+1-617-495-1001'
    },
    stats: {
      totalCredentialsIssued: 1500,
      totalMembers: 52,
      totalVerifications: 2500
    }
  },
  {
    organizationId: 'ORG-UNI-004',
    name: 'University of California, Berkeley',
    type: 'institution',
    mspId: 'BerkeleyMSP',
    email: 'contact@berkeley.edu',
    phone: '+1-510-642-6000',
    website: 'https://www.berkeley.edu',
    address: {
      street: '200 California Hall',
      city: 'Berkeley',
      state: 'California',
      country: 'United States',
      zipCode: '94720'
    },
    logo: 'https://brand.berkeley.edu/wp-content/uploads/2023/01/uc-berkeley-logo-blue.png',
    description: 'A public research university known for its academic excellence and social activism.',
    approved: true,
    approvedBy: null,
    approvedAt: new Date('2023-12-04T10:00:00Z'),
    isActive: true,
    blockchainRegistered: true,
    blockchainTxId: 'TX-BERK-001-BC-2023',
    adminContact: {
      name: 'Dr. Lisa Martinez',
      email: 'registrar@berkeley.edu',
      phone: '+1-510-642-6001'
    },
    stats: {
      totalCredentialsIssued: 1100,
      totalMembers: 42,
      totalVerifications: 1850
    }
  },
  {
    organizationId: 'ORG-UNI-005',
    name: 'Indian Institute of Technology Delhi',
    type: 'institution',
    mspId: 'IITDMSP',
    email: 'contact@iitd.ac.in',
    phone: '+91-11-2659-1000',
    website: 'https://home.iitd.ac.in',
    address: {
      street: 'Hauz Khas',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      zipCode: '110016'
    },
    logo: 'https://home.iitd.ac.in/img/logo.png',
    description: 'One of the premier engineering institutions in India, known for excellence in technology and research.',
    approved: true,
    approvedBy: null,
    approvedAt: new Date('2023-12-05T10:00:00Z'),
    isActive: true,
    blockchainRegistered: true,
    blockchainTxId: 'TX-IITD-001-BC-2023',
    adminContact: {
      name: 'Prof. David Kumar',
      email: 'admin@iitdelhi.ac.in',
      phone: '+91-11-2659-1001'
    },
    stats: {
      totalCredentialsIssued: 850,
      totalMembers: 35,
      totalVerifications: 1400
    }
  },

  // ============================================
  // COMPANIES / RECRUITERS
  // ============================================
  {
    organizationId: 'ORG-COM-001',
    name: 'Google LLC',
    type: 'company',
    mspId: 'GoogleMSP',
    email: 'contact@google.com',
    phone: '+1-650-253-0000',
    website: 'https://www.google.com',
    address: {
      street: '1600 Amphitheatre Parkway',
      city: 'Mountain View',
      state: 'California',
      country: 'United States',
      zipCode: '94043'
    },
    logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    description: 'A multinational technology company specializing in Internet-related services and products.',
    approved: true,
    approvedBy: null,
    approvedAt: new Date('2023-12-06T10:00:00Z'),
    isActive: true,
    blockchainRegistered: true,
    blockchainTxId: 'TX-GOOG-001-BC-2023',
    adminContact: {
      name: 'Jennifer Smith',
      email: 'hr@google.com',
      phone: '+1-650-253-0001'
    },
    stats: {
      totalCredentialsIssued: 0,
      totalMembers: 15,
      totalVerifications: 450
    }
  },
  {
    organizationId: 'ORG-COM-002',
    name: 'Microsoft Corporation',
    type: 'company',
    mspId: 'MicrosoftMSP',
    email: 'contact@microsoft.com',
    phone: '+1-425-882-8080',
    website: 'https://www.microsoft.com',
    address: {
      street: 'One Microsoft Way',
      city: 'Redmond',
      state: 'Washington',
      country: 'United States',
      zipCode: '98052'
    },
    logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b',
    description: 'A leading technology company that develops, manufactures, and supports software and services.',
    approved: true,
    approvedBy: null,
    approvedAt: new Date('2023-12-07T10:00:00Z'),
    isActive: true,
    blockchainRegistered: true,
    blockchainTxId: 'TX-MSFT-001-BC-2023',
    adminContact: {
      name: 'Mark Thompson',
      email: 'recruiting@microsoft.com',
      phone: '+1-425-882-8081'
    },
    stats: {
      totalCredentialsIssued: 0,
      totalMembers: 12,
      totalVerifications: 380
    }
  },
  {
    organizationId: 'ORG-COM-003',
    name: 'Amazon.com Inc.',
    type: 'company',
    mspId: 'AmazonMSP',
    email: 'contact@amazon.com',
    phone: '+1-206-266-1000',
    website: 'https://www.amazon.com',
    address: {
      street: '410 Terry Avenue North',
      city: 'Seattle',
      state: 'Washington',
      country: 'United States',
      zipCode: '98109'
    },
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    description: 'A multinational technology company focusing on e-commerce, cloud computing, and artificial intelligence.',
    approved: true,
    approvedBy: null,
    approvedAt: new Date('2023-12-08T10:00:00Z'),
    isActive: true,
    blockchainRegistered: true,
    blockchainTxId: 'TX-AMZN-001-BC-2023',
    adminContact: {
      name: 'Amanda Rodriguez',
      email: 'talent@amazon.com',
      phone: '+1-206-266-1001'
    },
    stats: {
      totalCredentialsIssued: 0,
      totalMembers: 18,
      totalVerifications: 520
    }
  },
  {
    organizationId: 'ORG-COM-004',
    name: 'Meta Platforms Inc.',
    type: 'company',
    mspId: 'MetaMSP',
    email: 'contact@meta.com',
    phone: '+1-650-543-4800',
    website: 'https://www.meta.com',
    address: {
      street: '1 Hacker Way',
      city: 'Menlo Park',
      state: 'California',
      country: 'United States',
      zipCode: '94025'
    },
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    description: 'A technology conglomerate focused on social media, virtual reality, and metaverse technologies.',
    approved: true,
    approvedBy: null,
    approvedAt: new Date('2023-12-09T10:00:00Z'),
    isActive: true,
    blockchainRegistered: true,
    blockchainTxId: 'TX-META-001-BC-2023',
    adminContact: {
      name: 'Chris Lee',
      email: 'hr@meta.com',
      phone: '+1-650-543-4801'
    },
    stats: {
      totalCredentialsIssued: 0,
      totalMembers: 10,
      totalVerifications: 290
    }
  },
  {
    organizationId: 'ORG-COM-005',
    name: 'Apple Inc.',
    type: 'company',
    mspId: 'AppleMSP',
    email: 'contact@apple.com',
    phone: '+1-408-996-1010',
    website: 'https://www.apple.com',
    address: {
      street: 'One Apple Park Way',
      city: 'Cupertino',
      state: 'California',
      country: 'United States',
      zipCode: '95014'
    },
    logo: 'https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png',
    description: 'A multinational technology company that designs and manufactures consumer electronics and software.',
    approved: true,
    approvedBy: null,
    approvedAt: new Date('2023-12-10T10:00:00Z'),
    isActive: true,
    blockchainRegistered: true,
    blockchainTxId: 'TX-AAPL-001-BC-2023',
    adminContact: {
      name: 'Patricia Brown',
      email: 'recruiting@apple.com',
      phone: '+1-408-996-1011'
    },
    stats: {
      totalCredentialsIssued: 0,
      totalMembers: 14,
      totalVerifications: 340
    }
  }
];

