import express from 'express';
import Joi from 'joi';
import fabricNetwork from '../services/fabricNetwork.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

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

// Get credential by ID
router.get('/:credentialId', async (req, res) => {
  try {
    const { credentialId } = req.params;
    
    const credential = await fabricNetwork.getCredential(credentialId);
    
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    res.json({
      success: true,
      credential
    });
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