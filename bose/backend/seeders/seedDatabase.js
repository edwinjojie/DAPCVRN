import dotenv from 'dotenv';
import database from '../config/database.js';
import { User, Organization, Credential, Job, Application, Message, Notification, Profile } from '../models/index.js';

// Import seed data
import { usersData } from './data/users.seed.js';
import { organizationsData } from './data/organizations.seed.js';
import { credentialsData } from './data/credentials.seed.js';
import { jobsData } from './data/jobs.seed.js';
import { applicationsData } from './data/applications.seed.js';
import { profilesData } from './data/profiles.seed.js';
import { messagesData } from './data/messages.seed.js';
import { notificationsData } from './data/notifications.seed.js';

dotenv.config();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`)
};

// Store created documents for reference mapping
const createdDocs = {
  users: {},
  organizations: {},
  credentials: {},
  jobs: {},
  applications: {},
  profiles: {},
  messages: {},
  notifications: {}
};

async function clearDatabase() {
  log.section('🗑️  CLEARING EXISTING DATA');
  
  try {
    await User.deleteMany({});
    log.success('Cleared Users collection');
    
    await Organization.deleteMany({});
    log.success('Cleared Organizations collection');
    
    await Credential.deleteMany({});
    log.success('Cleared Credentials collection');
    
    await Job.deleteMany({});
    log.success('Cleared Jobs collection');
    
    await Application.deleteMany({});
    log.success('Cleared Applications collection');
    
    await Profile.deleteMany({});
    log.success('Cleared Profiles collection');
    
    await Message.deleteMany({});
    log.success('Cleared Messages collection');
    
    await Notification.deleteMany({});
    log.success('Cleared Notifications collection');
    
    log.success('All collections cleared successfully');
  } catch (error) {
    log.error(`Failed to clear database: ${error.message}`);
    throw error;
  }
}

async function seedUsers() {
  log.section('👥 SEEDING USERS');
  
  try {
    for (const userData of usersData) {
      const user = await User.create(userData);
      createdDocs.users[userData.userId] = user;
      log.info(`Created user: ${user.name} (${user.role})`);
    }
    log.success(`Created ${Object.keys(createdDocs.users).length} users`);
  } catch (error) {
    log.error(`Failed to seed users: ${error.message}`);
    throw error;
  }
}

async function seedOrganizations() {
  log.section('🏢 SEEDING ORGANIZATIONS');
  
  try {
    const adminUser = createdDocs.users['USR-ADMIN-001'];
    
    for (const orgData of organizationsData) {
      const data = { ...orgData };
      if (data.approvedBy === null && data.approved) {
        data.approvedBy = adminUser._id;
      }
      
      const org = await Organization.create(data);
      createdDocs.organizations[orgData.organizationId] = org;
      log.info(`Created organization: ${org.name} (${org.type})`);
    }
    
    // Link users to organizations
    await linkUsersToOrganizations();
    
    log.success(`Created ${Object.keys(createdDocs.organizations).length} organizations`);
  } catch (error) {
    log.error(`Failed to seed organizations: ${error.message}`);
    throw error;
  }
}

async function linkUsersToOrganizations() {
  log.info('Linking users to organizations...');

  const links = {
    'USR-UNI-001': 'ORG-UNI-001', // MIT
    'USR-UNI-002': 'ORG-UNI-002', // Stanford
    'USR-UNI-003': 'ORG-UNI-003', // Harvard
    'USR-UNI-004': 'ORG-UNI-004', // Berkeley
    'USR-UNI-005': 'ORG-UNI-005', // IIT Delhi
    'USR-REC-001': 'ORG-COM-001', // Google
    'USR-REC-002': 'ORG-COM-002', // Microsoft
    'USR-REC-003': 'ORG-COM-003', // Amazon
    'USR-REC-004': 'ORG-COM-004', // Meta
    'USR-REC-005': 'ORG-COM-005'  // Apple
  };

  for (const [userId, orgId] of Object.entries(links)) {
    const user = createdDocs.users[userId];
    const org = createdDocs.organizations[orgId];

    if (user && org) {
      user.organizationId = org._id;
      user.organization = org.name; // Also set the organization name string
      await user.save();
      log.info(`Linked ${user.name} to ${org.name}`);
    }
  }

  log.success('Users linked to organizations');
}

async function seedCredentials() {
  log.section('🎓 SEEDING CREDENTIALS');
  
  try {
    const userMapping = {
      'CRED-001': 'USR-STU-001', // Alice
      'CRED-002': 'USR-STU-001',
      'CRED-003': 'USR-STU-002', // Bob
      'CRED-004': 'USR-STU-002',
      'CRED-005': 'USR-STU-003', // Carol
      'CRED-006': 'USR-STU-004', // David
      'CRED-007': 'USR-STU-004',
      'CRED-008': 'USR-STU-005', // Emma
      'CRED-009': 'USR-STU-006', // Frank
      'CRED-010': 'USR-STU-007', // Grace
      'CRED-011': 'USR-STU-008', // Henry
      'CRED-012': 'USR-STU-009'  // Ivy
    };
    
    const issuerMapping = {
      'CRED-001': 'USR-UNI-001', // MIT
      'CRED-002': 'USR-UNI-001',
      'CRED-003': 'USR-UNI-002', // Stanford
      'CRED-004': 'USR-UNI-002',
      'CRED-005': 'USR-UNI-003', // Harvard
      'CRED-006': 'USR-UNI-004', // Berkeley
      'CRED-007': 'USR-UNI-004',
      'CRED-008': 'USR-UNI-005', // IIT Delhi
      'CRED-009': 'USR-UNI-001', // MIT
      'CRED-010': 'USR-UNI-002', // Stanford
      'CRED-011': 'USR-UNI-003', // Harvard
      'CRED-012': 'USR-UNI-004'  // Berkeley
    };
    
    const orgMapping = {
      'CRED-001': 'ORG-UNI-001',
      'CRED-002': 'ORG-UNI-001',
      'CRED-003': 'ORG-UNI-002',
      'CRED-004': 'ORG-UNI-002',
      'CRED-005': 'ORG-UNI-003',
      'CRED-006': 'ORG-UNI-004',
      'CRED-007': 'ORG-UNI-004',
      'CRED-008': 'ORG-UNI-005',
      'CRED-009': 'ORG-UNI-001',
      'CRED-010': 'ORG-UNI-002',
      'CRED-011': 'ORG-UNI-003',
      'CRED-012': 'ORG-UNI-004'
    };

    for (const credData of credentialsData) {
      const data = { ...credData };

      // Get user and organization objects
      const user = createdDocs.users[userMapping[credData.credentialId]];
      const issuerUser = createdDocs.users[issuerMapping[credData.credentialId]];
      const org = createdDocs.organizations[orgMapping[credData.credentialId]];

      // Set ObjectId references
      data.userId = user?._id;
      data.issuerId = issuerUser?._id;
      data.institutionId = org?._id;

      // Set required string fields from the objects
      data.studentName = user?.name;
      data.studentEmail = user?.email;
      data.issuer = issuerUser?.name;
      data.institution = org?.name;

      // If credential is verified, set verifiedBy to the issuer (university)
      if (data.verifiedBy === null && data.status === 'verified') {
        data.verifiedBy = issuerUser?._id;
      }

      const credential = await Credential.create(data);
      createdDocs.credentials[credData.credentialId] = credential;
      log.info(`Created credential: ${credential.title} for ${user?.name}`);
    }
    
    log.success(`Created ${Object.keys(createdDocs.credentials).length} credentials`);
  } catch (error) {
    log.error(`Failed to seed credentials: ${error.message}`);
    throw error;
  }
}

async function seedJobs() {
  log.section('💼 SEEDING JOBS');
  
  try {
    const jobMapping = {
      'JOB-001': { employer: 'USR-REC-001', company: 'ORG-COM-001' }, // Google
      'JOB-002': { employer: 'USR-REC-001', company: 'ORG-COM-001' },
      'JOB-003': { employer: 'USR-REC-002', company: 'ORG-COM-002' }, // Microsoft
      'JOB-004': { employer: 'USR-REC-002', company: 'ORG-COM-002' },
      'JOB-005': { employer: 'USR-REC-003', company: 'ORG-COM-003' }, // Amazon
      'JOB-006': { employer: 'USR-REC-003', company: 'ORG-COM-003' },
      'JOB-007': { employer: 'USR-REC-004', company: 'ORG-COM-004' }, // Meta
      'JOB-008': { employer: 'USR-REC-005', company: 'ORG-COM-005' }, // Apple
      'JOB-009': { employer: 'USR-REC-001', company: 'ORG-COM-001' }  // Google
    };
    
    for (const jobData of jobsData) {
      const data = { ...jobData };
      const mapping = jobMapping[jobData.jobId];
      data.employerId = createdDocs.users[mapping.employer]?._id;
      data.companyId = createdDocs.organizations[mapping.company]?._id;
      
      const job = await Job.create(data);
      createdDocs.jobs[jobData.jobId] = job;
      log.info(`Created job: ${job.title} at ${job.company}`);
    }
    
    log.success(`Created ${Object.keys(createdDocs.jobs).length} jobs`);
  } catch (error) {
    log.error(`Failed to seed jobs: ${error.message}`);
    throw error;
  }
}

async function seedApplications() {
  log.section('📝 SEEDING APPLICATIONS');
  
  try {
    const appMapping = {
      'APP-001': { job: 'JOB-001', candidate: 'USR-STU-001', recruiter: 'USR-REC-001', creds: ['CRED-001', 'CRED-002'] },
      'APP-002': { job: 'JOB-004', candidate: 'USR-STU-002', recruiter: 'USR-REC-002', creds: ['CRED-003', 'CRED-004'] },
      'APP-003': { job: 'JOB-002', candidate: 'USR-STU-003', recruiter: 'USR-REC-001', creds: ['CRED-005'] },
      'APP-004': { job: 'JOB-006', candidate: 'USR-STU-004', recruiter: 'USR-REC-003', creds: ['CRED-006', 'CRED-007'] },
      'APP-005': { job: 'JOB-007', candidate: 'USR-STU-007', recruiter: 'USR-REC-004', creds: ['CRED-010'] },
      'APP-006': { job: 'JOB-003', candidate: 'USR-STU-005', recruiter: 'USR-REC-002', creds: ['CRED-008'] },
      'APP-007': { job: 'JOB-009', candidate: 'USR-STU-006', recruiter: 'USR-REC-001', creds: ['CRED-009'] }
    };
    
    for (const appData of applicationsData) {
      const data = { ...appData };
      const mapping = appMapping[appData.applicationId];
      
      data.jobId = createdDocs.jobs[mapping.job]?._id;
      data.candidateId = createdDocs.users[mapping.candidate]?._id;
      
      // Map attached credentials
      data.attachedCredentials = data.attachedCredentials.map((cred, index) => ({
        ...cred,
        credentialId: createdDocs.credentials[mapping.creds[index]]?._id
      }));
      
      // Map timeline updatedBy
      data.timeline = data.timeline.map(entry => ({
        ...entry,
        updatedBy: entry.updatedBy === null ? createdDocs.users[mapping.recruiter]?._id : entry.updatedBy
      }));
      
      const application = await Application.create(data);
      createdDocs.applications[appData.applicationId] = application;
      
      // Update job application count
      const job = await Job.findById(data.jobId);
      if (job) {
        job.totalApplications += 1;
        await job.save();
      }
      
      log.info(`Created application: ${application.candidateName} -> ${mapping.job}`);
    }
    
    log.success(`Created ${Object.keys(createdDocs.applications).length} applications`);
  } catch (error) {
    log.error(`Failed to seed applications: ${error.message}`);
    throw error;
  }
}

async function seedProfiles() {
  log.section('👤 SEEDING PROFILES');

  try {
    const profileMapping = {
      0: 'USR-STU-001', // Alice
      1: 'USR-STU-002', // Bob
      2: 'USR-STU-003', // Carol
      3: 'USR-STU-007'  // Grace
    };

    for (let i = 0; i < profilesData.length; i++) {
      const profileData = profilesData[i];
      const data = { ...profileData };
      data.userId = createdDocs.users[profileMapping[i]]?._id;

      const profile = await Profile.create(data);
      createdDocs.profiles[profileMapping[i]] = profile;
      log.info(`Created profile: ${profile.firstName} ${profile.lastName}`);
    }

    log.success(`Created ${Object.keys(createdDocs.profiles).length} profiles`);
  } catch (error) {
    log.error(`Failed to seed profiles: ${error.message}`);
    throw error;
  }
}

async function seedMessages() {
  log.section('💬 SEEDING MESSAGES');

  try {
    const messageMapping = {
      'MSG-001': { sender: 'USR-REC-001', recipient: 'USR-STU-001', job: 'JOB-001', app: 'APP-001' },
      'MSG-002': { sender: 'USR-STU-001', recipient: 'USR-REC-001', job: 'JOB-001', app: 'APP-001' },
      'MSG-003': { sender: 'USR-REC-001', recipient: 'USR-STU-001', job: 'JOB-001', app: 'APP-001' },
      'MSG-004': { sender: 'USR-REC-002', recipient: 'USR-STU-002', job: 'JOB-004', app: 'APP-002' },
      'MSG-005': { sender: 'USR-STU-002', recipient: 'USR-REC-002', job: 'JOB-004', app: 'APP-002' },
      'MSG-006': { sender: 'USR-REC-001', recipient: 'USR-STU-003', job: 'JOB-002', app: 'APP-003' },
      'MSG-007': { sender: 'USR-REC-004', recipient: 'USR-STU-007', job: 'JOB-007', app: 'APP-005' },
      'MSG-008': { sender: 'USR-ADMIN-001', recipient: 'USR-STU-001', cred: 'CRED-001' },
      'MSG-009': { sender: 'USR-ADMIN-001', recipient: 'USR-STU-002', app: 'APP-002' },
      'MSG-010': { sender: 'USR-REC-001', recipient: 'USR-STU-001', job: 'JOB-001', app: 'APP-001' }
    };

    for (const msgData of messagesData) {
      const data = { ...msgData };
      const mapping = messageMapping[msgData.messageId];

      data.senderId = createdDocs.users[mapping.sender]?._id;
      data.recipientId = createdDocs.users[mapping.recipient]?._id;

      if (mapping.job) data.relatedJob = createdDocs.jobs[mapping.job]?._id;
      if (mapping.app) data.relatedApplication = createdDocs.applications[mapping.app]?._id;
      if (mapping.cred) data.relatedCredential = createdDocs.credentials[mapping.cred]?._id;

      const message = await Message.create(data);
      createdDocs.messages[msgData.messageId] = message;
      log.info(`Created message: ${message.senderName} -> ${message.recipientName}`);
    }

    log.success(`Created ${Object.keys(createdDocs.messages).length} messages`);
  } catch (error) {
    log.error(`Failed to seed messages: ${error.message}`);
    throw error;
  }
}

async function seedNotifications() {
  log.section('🔔 SEEDING NOTIFICATIONS');

  try {
    const notifMapping = {
      'NOTIF-001': { user: 'USR-STU-001', cred: 'CRED-001' },
      'NOTIF-002': { user: 'USR-STU-001', job: 'JOB-001', app: 'APP-001' },
      'NOTIF-003': { user: 'USR-STU-001', relatedUser: 'USR-REC-001' },
      'NOTIF-004': { user: 'USR-STU-001', job: 'JOB-001', app: 'APP-001' },
      'NOTIF-005': { user: 'USR-STU-001' },
      'NOTIF-006': { user: 'USR-STU-002', cred: 'CRED-003' },
      'NOTIF-007': { user: 'USR-STU-002', job: 'JOB-004', app: 'APP-002' },
      'NOTIF-008': { user: 'USR-STU-002', job: 'JOB-004', app: 'APP-002' },
      'NOTIF-009': { user: 'USR-STU-003', job: 'JOB-002', app: 'APP-003' },
      'NOTIF-010': { user: 'USR-STU-003' },
      'NOTIF-011': { user: 'USR-STU-007', cred: 'CRED-010' },
      'NOTIF-012': { user: 'USR-STU-007', job: 'JOB-007', app: 'APP-005' },
      'NOTIF-013': { user: 'USR-STU-007' },
      'NOTIF-014': { user: 'USR-STU-005', job: 'JOB-003', app: 'APP-006' },
      'NOTIF-015': { user: 'USR-REC-001', job: 'JOB-001', app: 'APP-001' },
      'NOTIF-016': { user: 'USR-REC-002', job: 'JOB-004', app: 'APP-002' },
      'NOTIF-017': { user: 'USR-ADMIN-001' },
      'NOTIF-018': { user: 'USR-UNI-001', cred: 'CRED-001' }
    };

    for (const notifData of notificationsData) {
      const data = { ...notifData };
      const mapping = notifMapping[notifData.notificationId];

      data.userId = createdDocs.users[mapping.user]?._id;

      if (mapping.job) data.relatedJob = createdDocs.jobs[mapping.job]?._id;
      if (mapping.app) data.relatedApplication = createdDocs.applications[mapping.app]?._id;
      if (mapping.cred) data.relatedCredential = createdDocs.credentials[mapping.cred]?._id;
      if (mapping.relatedUser) data.relatedUser = createdDocs.users[mapping.relatedUser]?._id;

      const notification = await Notification.create(data);
      createdDocs.notifications[notifData.notificationId] = notification;
      log.info(`Created notification: ${notification.title} for ${mapping.user}`);
    }

    log.success(`Created ${Object.keys(createdDocs.notifications).length} notifications`);
  } catch (error) {
    log.error(`Failed to seed notifications: ${error.message}`);
    throw error;
  }
}

async function printSummary() {
  log.section('📊 SEEDING SUMMARY');

  console.log(`
${colors.bright}Database seeded successfully!${colors.reset}

${colors.cyan}Collections:${colors.reset}
  • Users:          ${colors.green}${Object.keys(createdDocs.users).length}${colors.reset}
  • Organizations:  ${colors.green}${Object.keys(createdDocs.organizations).length}${colors.reset}
  • Credentials:    ${colors.green}${Object.keys(createdDocs.credentials).length}${colors.reset}
  • Jobs:           ${colors.green}${Object.keys(createdDocs.jobs).length}${colors.reset}
  • Applications:   ${colors.green}${Object.keys(createdDocs.applications).length}${colors.reset}
  • Profiles:       ${colors.green}${Object.keys(createdDocs.profiles).length}${colors.reset}
  • Messages:       ${colors.green}${Object.keys(createdDocs.messages).length}${colors.reset}
  • Notifications:  ${colors.green}${Object.keys(createdDocs.notifications).length}${colors.reset}

${colors.cyan}Test Accounts:${colors.reset}
  ${colors.yellow}Admin:${colors.reset}       admin@bose.edu / password123
  ${colors.yellow}Student:${colors.reset}     alice.johnson@student.edu / password123
  ${colors.yellow}Recruiter:${colors.reset}   hr@google.com / password123
  ${colors.yellow}Institution:${colors.reset} registrar@mit.edu / password123
  ${colors.yellow}Verifier:${colors.reset}    verifier@bose.edu / password123
  ${colors.yellow}Auditor:${colors.reset}     michael.auditor@gov.edu / password123

${colors.green}✓ Database is ready for use!${colors.reset}
  `);
}

async function main() {
  try {
    console.log(`
${colors.bright}${colors.cyan}╔════════════════════════════════════════════╗
║   BOSE Database Seeder                     ║
║   Blockchain-Oriented Student Evaluation   ║
╚════════════════════════════════════════════╝${colors.reset}
    `);

    // Connect to database
    log.info('Connecting to MongoDB...');
    await database.connect();
    log.success('Connected to MongoDB');

    // Clear existing data
    await clearDatabase();

    // Seed data in order (respecting dependencies)
    await seedUsers();
    await seedOrganizations();
    await seedCredentials();
    await seedJobs();
    await seedApplications();
    await seedProfiles();
    await seedMessages();
    await seedNotifications();

    // Print summary
    await printSummary();

    // Close connection
    await database.disconnect();
    log.success('Database connection closed');

    process.exit(0);
  } catch (error) {
    log.error(`Seeding failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the seeder
main();


