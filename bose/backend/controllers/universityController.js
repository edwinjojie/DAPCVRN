import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { Credential, User } from '../models/index.js';
import { generateCredentialHash } from '../utils/hashCredential.js';
import * as blockchainService from '../services/blockchainService.js';

/**
 * Safely convert a string to ObjectId. Returns null on failure.
 */
function toObjectId(id) {
  try {
    return id && mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
  } catch {
    return null;
  }
}

/**
 * POST /api/university/issue-credential
 * Issues a new academic credential for a student.
 * User identity comes from x-user-* headers (no JWT required).
 */
export const issueCredential = async (req, res) => {
  try {
    // ─── 1. Get issuer identity from headers ───────────────────────────────
    const issuerId  = toObjectId(req.user?.userId);
    const issuerOrg = req.user?.organization || '';
    const issuerEmail = req.user?.email || '';

    // ─── 2. Validate body ─────────────────────────────────────────────────
    const schema = Joi.object({
      studentId:      Joi.string().required(),
      credentialName: Joi.string().required(),
      institution:    Joi.string().required(),
      degree:         Joi.string().required(),
      issueDate:      Joi.date().required(),
      studentName:    Joi.string().optional(),
      studentEmail:   Joi.string().email().optional().allow(''),
    });

    const { error, value } = schema.validate(req.body, { allowUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    // ─── 3. Resolve student info ──────────────────────────────────────────
    let studentObjectId = toObjectId(value.studentId);
    let studentName     = value.studentName || 'Student';
    let studentEmail    = value.studentEmail || '';

    if (!studentObjectId || !studentName || !studentEmail) {
      // Try lookup by ObjectId
      let student = null;
      if (studentObjectId) {
        student = await User.findById(studentObjectId).select('name email').lean();
      }
      // Try lookup by custom userId field or email
      if (!student) {
        student = await User.findOne({ $or: [{ userId: value.studentId }, { email: value.studentId }] })
          .select('_id name email').lean();
        if (student) studentObjectId = toObjectId(student._id.toString());
      }
      if (student) {
        studentName  = student.name  || studentName;
        studentEmail = student.email || studentEmail;
      }
    }

    // Fallbacks – ensure required fields are never empty
    if (!studentObjectId) studentObjectId = issuerId; // Use issuer as placeholder
    if (!studentName)     studentName = 'Student';
    if (!studentEmail)    studentEmail = `student+${uuidv4().slice(0,8)}@placeholder.local`;

    // Ensure issuerId exists (use a synthetic ObjectId as last resort)
    const resolvedIssuerId = issuerId || new mongoose.Types.ObjectId();

    // ─── 4. Generate hash ─────────────────────────────────────────────────
    const hash = generateCredentialHash(
      value.studentId, value.credentialName, value.institution, value.issueDate
    );

    // ─── 5. Save to MongoDB ───────────────────────────────────────────────
    const credentialId = uuidv4();

    const newCred = new Credential({
      credentialId,
      userId:        studentObjectId,
      issuerId:      resolvedIssuerId,
      organization:  issuerOrg || value.institution,
      title:         value.credentialName,
      credentialName: value.credentialName,
      type:          'degree',
      course:        value.degree,
      issueDate:     value.issueDate,
      institution:   value.institution,
      issuer:        issuerOrg || issuerEmail || value.institution,
      studentId:     value.studentId,
      studentName,
      studentEmail,
      credentialHash: hash,
      dataHash:      hash,
      status:        'pending',
      createdBy:     resolvedIssuerId,
    });

    await newCred.save();

    // ─── 6. Best-effort blockchain submission ─────────────────────────────
    let blockchainResult = { status: 'pending' };
    try {
      const bcResponse = await blockchainService.addCertificate({
        credentialId,
        studentId:      value.studentId,
        institution:    value.institution,
        credentialHash: hash,
        issueDate:      value.issueDate,
      });
      newCred.blockchainTxId = bcResponse.txId || hash;
      await newCred.save();
      blockchainResult = { status: 'submitted', txId: bcResponse.txId || hash };
    } catch (bcError) {
      console.warn('Blockchain submission skipped (Fabric offline):', bcError.message);
      blockchainResult = { status: 'offline', error: bcError.message };
    }

    res.status(201).json({
      success:    true,
      message:    'Credential issued successfully',
      data:       newCred,
      blockchain: blockchainResult,
    });

  } catch (err) {
    console.error('Error in universityController.issueCredential:', err.message, err.errors);
    res.status(500).json({
      error:   'Internal server error while issuing credential',
      details: err.message,
    });
  }
};

// ── GET /api/university/credentials ──────────────────────────────────────────
export const getUniversityCredentials = async (req, res) => {
  try {
    const issuerId = toObjectId(req.user?.userId);

    // Return credentials issued by this university, or all if no userId
    const query = issuerId
      ? { $or: [{ issuerId }, { createdBy: issuerId }] }
      : {};

    const credentials = await Credential.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: credentials });
  } catch (err) {
    console.error('Error in getUniversityCredentials:', err);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
};
