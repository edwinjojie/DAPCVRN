import express from 'express';
import Joi from 'joi';
import fabricNetwork from '../services/fabricNetwork.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Credential } from '../models/index.js';
import User from '../models/User.js';
import VerificationRequest from '../models/VerificationRequest.js';

const router = express.Router();

// Multer memory storage so we can compute hash before persisting
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// GET my credentials (real DB-backed)
router.get('/my', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const creds = await Credential.find({ userId }).sort({ issueDate: -1 }).lean();
    res.json(creds); // Return array directly for frontend compatibility
  } catch (error) {
    console.error('Error fetching user credentials:', error);
    res.status(500).json({ error: 'Failed to load credentials' });
  }
});

// Upload a credential file and metadata
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });

    const allowed = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Compute SHA-256 hash of the file
    const dataHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    // Persist file to local uploads folder (backend/uploads/credentials)
    const uploadsDir = path.join(process.cwd(), 'backend', 'uploads', 'credentials');
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    const filename = `${uuidv4()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filepath, req.file.buffer);

    // Try to fetch user info from DB to populate required fields
    let userRecord = null;
    try { userRecord = await User.findById(userId).lean(); } catch (e) { /* ignore */ }

    const credentialId = uuidv4();
    const now = new Date();

    const newCred = new Credential({
      credentialId,
      userId,
      studentName: req.body.studentName || userRecord?.name || req.user?.name || 'Unknown Student',
      studentEmail: req.body.studentEmail || userRecord?.email || req.user?.email || 'unknown@example.com',
      type: req.body.type || 'other',
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      institution: req.body.institution || req.body.issuer || req.body.organization || (userRecord?.organization || 'Unknown'),
      institutionId: req.body.institutionId || null,
      issuer: req.body.issuer || (userRecord?.organization || 'Self'),
      issuerId: req.body.issuerId || userId,
      issueDate: req.body.issuedOn ? new Date(req.body.issuedOn) : now,
      status: 'pending',
      dataHash,
      organization: req.body.organization || userRecord?.organization || req.user?.organization || 'Org1MSP',
      attachments: [{ filename, url: `/uploads/credentials/${filename}`, uploadedAt: now }]
    });

    await newCred.save();

    // Auto-create verification request by finding verifier from institution name
    const institutionName = req.body.institution;

    if (institutionName && institutionName.trim() !== '') {
      console.log(`Looking for verifier for institution: ${institutionName}`);

      // Try to find a verifier from this institution
      // Use case-insensitive regex to match institution names flexibly
      const verifier = await User.findOne({
        $or: [
          { organization: institutionName },
          { organization: { $regex: new RegExp(institutionName, 'i') } }
        ],
        role: 'university',
        isActive: true
      }).lean();

      if (verifier) {
        console.log(`Found verifier: ${verifier.name} (${verifier.email}) for institution: ${institutionName}`);

        const vr = new VerificationRequest({
          credentialId: newCred._id,
          requesterId: userId,
          verifierId: verifier._id,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await vr.save();

        console.log(`Verification request created: ${vr._id}`);

        // Notify via websocket
        try {
          if (global.wss) {
            global.wss.clients.forEach(client => {
              if (client.readyState === 1) {
                client.send(JSON.stringify({
                  type: 'verification.request',
                  requestId: vr._id,
                  credentialId: newCred.credentialId,
                  verifierId: verifier._id,
                  verifierName: verifier.name,
                  studentName: newCred.studentName,
                  credentialTitle: newCred.title
                }));
              }
            });
          }
        } catch (e) {
          console.warn('WebSocket notification failed:', e);
        }
      } else {
        console.log(`No verifier found for institution: ${institutionName}`);
        console.log('Credential uploaded but no verification request created');
      }
    } else {
      console.log('No institution name provided, skipping verification request creation');
    }

    // Broadcast websocket event for uploads
    try {
      if (global.wss) {
        global.wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'credential.uploaded',
              credentialId: credentialId,
              userId,
              timestamp: new Date().toISOString()
            }));
          }
        });
      }
    } catch (e) { console.warn('WebSocket broadcast failed', e); }

    res.status(201).json({ success: true, credential: newCred.toObject() });
  } catch (error) {
    console.error('Error uploading credential:', error);
    res.status(500).json({ error: 'Failed to upload credential' });
  }
});

// Delete credential
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user?.userId || req.user?.id;
    const cred = await Credential.findOne({ credentialId: id });
    if (!cred) return res.status(404).json({ error: 'Credential not found' });
    if (String(cred.userId) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await cred.remove();
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting credential:', error);
    res.status(500).json({ error: 'Failed to delete credential' });
  }
});

// Request verification for an uploaded credential
router.post('/request/:credentialId', async (req, res) => {
  try {
    const { credentialId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const cred = await Credential.findOne({ credentialId });
    if (!cred) return res.status(404).json({ error: 'Credential not found' });
    if (String(cred.userId) !== String(userId)) {
      return res.status(403).json({ error: 'Can only request verification for your own credentials' });
    }

    const verifierId = req.body.verifierId;
    if (!verifierId) return res.status(400).json({ error: 'verifierId is required' });

    const vr = new VerificationRequest({
      credentialId: cred._id,
      requesterId: userId,
      verifierId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await vr.save();

    // Notify via websocket
    try {
      if (global.wss) {
        global.wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: 'verification.request', requestId: vr._id, credentialId: cred.credentialId }));
          }
        });
      }
    } catch (e) { /* ignore */ }

    res.status(201).json({ success: true, request: vr.toObject() });
  } catch (error) {
    console.error('Error creating verification request:', error);
    res.status(500).json({ error: 'Failed to create verification request' });
  }
});

// Validation schemas
const issueCredentialSchema = Joi.object({
  studentId: Joi.string().required(),
  dataHash: Joi.string().required(),
  credentialType: Joi.string().default('academic'),
  metadata: Joi.object().default({})
});

const verifyCredentialSchema = Joi.object({
  credentialId: Joi.string().required(),
  dataHash: Joi.string().required()
});

const revokeCredentialSchema = Joi.object({
  credentialId: Joi.string().required(),
  reason: Joi.string().required()
});

// Issue credential
router.post('/issue', async (req, res) => {
  try {
    const { error, value } = issueCredentialSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user has permission to issue credentials
    if (!['employer', 'auditor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to issue credentials' });
    }

    const credentialId = uuidv4();
    const { studentId, dataHash, credentialType, metadata } = value;

    const result = await fabricNetwork.issueCredential(
      credentialId,
      studentId,
      dataHash,
      req.user.organization
    );

    res.json({
      success: true,
      credentialId,
      transactionId: result.transactionId,
      message: 'Credential issued successfully',
      endorsements: result.endorsements || [],
      timestamp: result.timestamp
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({ 
      error: error.message.includes('Endorsement') ? error.message : 'Failed to issue credential'
    });
  }
});

// List verification requests (for verifiers/institutions) - MUST BE BEFORE /:credentialId
router.get('/requests', async (req, res) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.userId || req.user?.id;

    console.log(`Fetching verification requests for user: ${userId}, role: ${role}`);

    let query = {};
    if (role === 'university') {
      query = { verifierId: userId };
    } else if (role === 'student') {
      query = { requesterId: userId };
    } else if (role === 'admin') {
      query = {};
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    console.log('Query:', JSON.stringify(query));

    const requests = await VerificationRequest.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${requests.length} verification requests`);

    // Populate credential details for each request
    const populatedRequests = await Promise.all(
      requests.map(async (request) => {
        const credential = await Credential.findById(request.credentialId).lean();
        const requester = await User.findById(request.requesterId).select('name email').lean();
        return {
          ...request,
          credential: credential || null,
          requester: requester || null
        };
      })
    );

    console.log(`Returning ${populatedRequests.length} populated requests`);
    res.json(populatedRequests);
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    res.status(500).json({ error: 'Failed to retrieve requests' });
  }
});

// Get credential by ID
router.get('/:credentialId', async (req, res) => {
  try {
    const { credentialId } = req.params;

    // Try MongoDB first
    const credential = await Credential.findById(credentialId).lean();

    if (credential) {
      return res.json({
        success: true,
        credential
      });
    }

    // Fallback to Fabric if not in MongoDB
    try {
      const fabricCred = await fabricNetwork.getCredential(credentialId);
      if (fabricCred) {
        return res.json({
          success: true,
          credential: fabricCred
        });
      }
    } catch (fabricError) {
      console.warn('Fabric network unavailable, using MongoDB only');
    }

    return res.status(404).json({ error: 'Credential not found' });
  } catch (error) {
    console.error('Error getting credential:', error);
    res.status(500).json({ error: 'Failed to retrieve credential' });
  }
});

// Verify credential
router.post('/verify', async (req, res) => {
  try {
    const { error, value } = verifyCredentialSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user has permission to verify credentials
    if (!['verifier', 'auditor', 'employer'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to verify credentials' });
    }

    const { credentialId, dataHash } = value;
    
    const verificationResult = await fabricNetwork.verifyCredential(credentialId, dataHash);
    
    res.json({
      success: true,
      ...verificationResult
    });
  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({ error: 'Failed to verify credential' });
  }
});

// Revoke credential
router.post('/revoke', async (req, res) => {
  try {
    const { error, value } = revokeCredentialSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user has permission to revoke credentials
    if (!['auditor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to revoke credentials' });
    }

    const { credentialId, reason } = value;
    
    const result = await fabricNetwork.revokeCredential(credentialId, reason);
    
    res.json({
      success: true,
      transactionId: result.transactionId,
      message: 'Credential revoked successfully',
      timestamp: result.timestamp
    });
  } catch (error) {
    console.error('Error revoking credential:', error);
    res.status(500).json({ 
      error: error.message.includes('Endorsement') ? error.message : 'Failed to revoke credential'
    });
  }
});

// Query credentials by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Students can only query their own credentials
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Can only access your own credentials' });
    }

    const credentials = await fabricNetwork.queryCredentialsByStudent(studentId);
    
    res.json({
      success: true,
      credentials: credentials || [],
      count: credentials ? credentials.length : 0
    });
  } catch (error) {
    console.error('Error querying credentials by student:', error);
    res.status(500).json({ error: 'Failed to retrieve credentials' });
  }
});

// Approve a verification request (verifier/institution)
router.post('/requests/:id/approve', async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user?.userId || req.user?.id;
    const role = req.user?.role;

    const vr = await VerificationRequest.findById(requestId);
    if (!vr) return res.status(404).json({ error: 'Verification request not found' });
    if (String(vr.verifierId) !== String(userId) && role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Load credential
    const cred = await Credential.findById(vr.credentialId);
    if (!cred) return res.status(404).json({ error: 'Credential not found' });

    // Mark approved
    vr.status = 'approved';
    vr.updatedAt = new Date();
    await vr.save();

    // Update credential as verified
    cred.status = 'verified';
    cred.verifiedBy = userId;
    cred.verifiedAt = new Date();
    await cred.save();

    // Push to blockchain (asynchronous call here, capture response)
    try {
      const fabricResult = await fabricNetwork.issueCredential(
        cred.credentialId,
        cred.userId,
        cred.dataHash,
        req.user?.organization || cred.organization
      );

      if (fabricResult && fabricResult.transactionId) {
        cred.blockchainTxId = fabricResult.transactionId;
        cred.blockchainTimestamp = fabricResult.timestamp ? new Date(fabricResult.timestamp) : new Date();
        await cred.save();
      }
    } catch (e) {
      console.warn('Blockchain push failed, request approved but blockchain anchor pending', e);
    }

    // Notify requester via websocket
    try {
      if (global.wss) {
        global.wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: 'verification.approved', requestId: vr._id, credentialId: cred.credentialId }));
          }
        });
      }
    } catch (e) { /* ignore */ }

    res.json({ success: true, message: 'Verification approved', credential: cred.toObject() });
  } catch (error) {
    console.error('Error approving verification request:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

// Reject a verification request
router.post('/requests/:id/reject', async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user?.userId || req.user?.id;
    const role = req.user?.role;

    const vr = await VerificationRequest.findById(requestId);
    if (!vr) return res.status(404).json({ error: 'Verification request not found' });
    if (String(vr.verifierId) !== String(userId) && role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    vr.status = 'rejected';
    vr.notes = req.body.notes || null;
    vr.updatedAt = new Date();
    await vr.save();

    // Notify requester via websocket
    try {
      if (global.wss) {
        global.wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: 'verification.rejected', requestId: vr._id, credentialId: vr.credentialId }));
          }
        });
      }
    } catch (e) { /* ignore */ }

    res.json({ success: true, message: 'Verification request rejected' });
  } catch (error) {
    console.error('Error rejecting verification request:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// Query all credentials (auditor only)
router.get('/', async (req, res) => {
  try {
    // Only auditors can query all credentials
    if (req.user.role !== 'auditor') {
      return res.status(403).json({ error: 'Insufficient permissions to access all credentials' });
    }

    const { page = 1, limit = 50, status, issuer } = req.query;
    
    const allCredentials = await fabricNetwork.queryAllCredentials();
    
    // Apply filters
    let filteredCredentials = allCredentials || [];
    if (status) {
      filteredCredentials = filteredCredentials.filter(cred => cred.status === status);
    }
    if (issuer) {
      filteredCredentials = filteredCredentials.filter(cred => cred.issuer === issuer);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCredentials = filteredCredentials.slice(startIndex, endIndex);

    res.json({
      success: true,
      credentials: paginatedCredentials,
      totalCount: filteredCredentials.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredCredentials.length / limit)
    });
  } catch (error) {
    console.error('Error querying all credentials:', error);
    res.status(500).json({ error: 'Failed to retrieve credentials' });
  }
});

// Batch issue credentials (future feature hook)
router.post('/batch/issue', async (req, res) => {
  try {
    // Check permissions
    if (!['employer', 'auditor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to batch issue credentials' });
    }

    const { credentials } = req.body;
    
    if (!Array.isArray(credentials) || credentials.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials array' });
    }

    // Simulate batch processing
    const results = [];
    for (const cred of credentials) {
      try {
        const credentialId = uuidv4();
        const result = await fabricNetwork.issueCredential(
          credentialId,
          cred.studentId,
          cred.dataHash,
          req.user.organization
        );
        results.push({ success: true, credentialId, ...result });
      } catch (error) {
        results.push({ success: false, error: error.message, studentId: cred.studentId });
      }
    }

    res.json({
      success: true,
      message: `Batch processing completed`,
      results,
      summary: {
        total: credentials.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    console.error('Error batch issuing credentials:', error);
    res.status(500).json({ error: 'Failed to process batch issuance' });
  }
});

export default router;