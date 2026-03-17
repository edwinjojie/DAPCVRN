import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Organization, Credential, VerificationRequest, AuditLog } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bose';

async function seedAdminData() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Create More Organizations
    console.log('Seeding Organizations...');
    const orgsToSeed = [
      {
        organizationId: 'ORG-UNIV-002',
        name: 'Stanford University',
        type: 'university',
        mspId: 'StanfordMSP',
        email: 'admin@stanford.edu',
        status: 'approved',
        approved: true,
        isActive: true,
        website: 'https://stanford.edu',
        address: { city: 'Stanford', country: 'USA' }
      },
      {
        organizationId: 'ORG-UNIV-003',
        name: 'Harvard University',
        type: 'university',
        mspId: 'HarvardMSP',
        email: 'verify@harvard.edu',
        status: 'pending',
        approved: false,
        isActive: false,
        website: 'https://harvard.edu',
        address: { city: 'Cambridge', country: 'USA' }
      },
      {
        organizationId: 'ORG-INST-004',
        name: 'Google Career Certs',
        type: 'institution',
        mspId: 'GoogleMSP',
        email: 'certs@google.com',
        status: 'suspended',
        approved: true,
        isActive: false,
        website: 'https://grow.google',
        address: { city: 'Mountain View', country: 'USA' }
      },
      {
        organizationId: 'ORG-UNIV-005',
        name: 'Unknown Academy',
        type: 'university',
        mspId: 'UnknownMSP',
        email: 'contact@unknown.edu',
        status: 'rejected',
        approved: false,
        isActive: false,
        rejectionReason: 'Failed background verification of educational license.'
      }
    ];

    const createdOrgs = [];
    for (const org of orgsToSeed) {
      const existing = await Organization.findOne({ 
        $or: [{ organizationId: org.organizationId }, { mspId: org.mspId }] 
      });
      if (existing) {
        console.log(`Organization ${org.name} already exists (ID or MSP match), skipping.`);
        createdOrgs.push(existing);
      } else {
        const created = await Organization.create(org);
        createdOrgs.push(created);
        console.log(`Created organization: ${org.name}`);
      }
    }

    // 2. Create Users for these Orgs
    console.log('Seeding Users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const usersToSeed = [
      {
        name: 'Stanford Admin',
        email: 'admin@stanford.edu',
        password: hashedPassword,
        role: 'university',
        organizationId: createdOrgs[0]._id,
        status: 'active',
        isActive: true
      },
      {
        name: 'Harvard Registrar',
        email: 'verify@harvard.edu',
        password: hashedPassword,
        role: 'university',
        organizationId: createdOrgs[1]._id,
        status: 'pending',
        isActive: true
      },
      {
        name: 'Spam User',
        email: 'spam@bot.com',
        password: hashedPassword,
        role: 'student',
        status: 'banned',
        isActive: false
      }
    ];

    const createdUsers = [];
    for (const user of usersToSeed) {
      const existing = await User.findOne({ email: user.email });
      if (existing) {
        console.log(`User ${user.email} already exists, skipping.`);
        createdUsers.push(existing);
      } else {
        const created = await User.create(user);
        createdUsers.push(created);
        console.log(`Created user: ${user.email}`);
      }
    }

    // 3. Create Credentials
    console.log('Seeding Credentials...');
    const stanfordAdmin = createdUsers[0];
    const studentUser = createdUsers[2]; // Using the "Spam User" as a placeholder student

    const credentials = [
      {
        credentialId: uuidv4(),
        userId: studentUser._id,
        studentName: 'John Doe',
        studentEmail: 'john@example.com',
        type: 'degree',
        title: 'Master of Computer Science',
        institution: 'Stanford University',
        institutionId: createdOrgs[0]._id,
        issuer: 'Stanford Registrar',
        issuerId: stanfordAdmin._id,
        organization: 'StanfordMSP',
        issueDate: new Date(),
        status: 'verified',
        blockchainTxId: '0x' + Math.random().toString(16).substr(2, 40),
        dataHash: 'hash_' + Math.random().toString(16).substr(2, 32)
      },
      {
        credentialId: uuidv4(),
        userId: studentUser._id,
        studentName: 'John Doe',
        studentEmail: 'john@example.com',
        type: 'degree',
        title: 'Master of Computer Science',
        institution: 'Stanford University',
        institutionId: createdOrgs[0]._id,
        issuer: 'Stanford Registrar',
        issuerId: stanfordAdmin._id,
        organization: 'StanfordMSP',
        issueDate: new Date(),
        status: 'verified',
        blockchainTxId: '0x' + Math.random().toString(16).substr(2, 40),
        dataHash: 'hash_' + Math.random().toString(16).substr(2, 32)
      }, // Duplicate
      {
        credentialId: uuidv4(),
        userId: studentUser._id,
        studentName: 'Bad Actor',
        studentEmail: 'bad@actor.com',
        type: 'diploma',
        title: 'Fake Diploma',
        institution: 'Stanford University',
        institutionId: createdOrgs[0]._id,
        issuer: 'Stanford Registrar',
        issuerId: stanfordAdmin._id,
        organization: 'StanfordMSP',
        issueDate: new Date(),
        status: 'revoked',
        revocationReason: 'Admin Override: Fraudulent data detected.',
        blockchainTxId: '0x' + Math.random().toString(16).substr(2, 40),
        dataHash: 'hash_' + Math.random().toString(16).substr(2, 32)
      }
    ];

    await Credential.deleteMany({ institution: 'Stanford University' }); // Clear old ones if any
    await Credential.insertMany(credentials);
    console.log('Created 3 credentials (including 1 duplicate and 1 revoked).');

    // 4. Create Audit Logs
    console.log('Seeding Audit Logs...');
    // Find an admin user or create a temporary one for logging
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@bose.network',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
    }

    const logs = [
      {
        adminId: adminUser._id,
        adminName: adminUser.name,
        action: 'APPROVE_ORG',
        targetType: 'ORGANIZATION',
        targetId: createdOrgs[0]._id.toString(),
        targetName: 'Stanford University',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        adminId: adminUser._id,
        adminName: adminUser.name,
        action: 'BAN_USER',
        targetType: 'USER',
        targetId: createdUsers[2]._id.toString(),
        targetName: 'Spam User',
        reason: 'Bot detected by system.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      }
    ];

    await AuditLog.insertMany(logs);
    console.log('Created audit logs.');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedAdminData();
