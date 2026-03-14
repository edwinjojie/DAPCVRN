/**
 * routes/certificate.js
 * Blockchain certificate endpoints – ES module, mounted at /api/certificate
 *
 * POST   /api/certificate/upload          – student uploads cert file (stored as PENDING)
 * POST   /api/certificate/approve/:certId – institution approves → writes to Fabric ledger
 * POST   /api/certificate/verify          – verify cert authenticity by re-uploading file
 * GET    /api/certificate/:certId         – query a certificate from the blockchain
 */

import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import BlockchainCertificate from '../models/BlockchainCertificate.js';
import fabricNetwork from '../services/fabricNetwork.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── Helper ────────────────────────────────────────────────────────────────────
function generateCertHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// ── POST /api/certificate/upload ──────────────────────────────────────────────
/**
 * Student uploads a certificate file.
 * The file hash is stored in MongoDB with status PENDING.
 * The actual blockchain write happens later when an institution approves it.
 *
 * Body (multipart/form-data):
 *   certificate   – file
 *   studentId     – string
 *   studentName   – string
 *   course        – string
 *   institution   – string
 *   grade         – string (optional)
 *   issueDate     – date string
 */
router.post('/upload', upload.single('certificate'), async (req, res) => {
  try {
    const { studentId, studentName, course, institution, grade, issueDate } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Certificate file is required' });
    }
    if (!studentId || !studentName || !course || !institution || !issueDate) {
      return res.status(400).json({ error: 'Missing required fields: studentId, studentName, course, institution, issueDate' });
    }

    const fileHash = generateCertHash(file.buffer);
    const certId   = `CERT_${studentId}_${Date.now()}`;

    await BlockchainCertificate.create({
      certId,
      studentId,
      studentName,
      course,
      institution,
      grade:     grade || '',
      issueDate: new Date(issueDate),
      fileHash,
      status:    'PENDING'
    });

    res.status(201).json({
      success:       true,
      message:       'Certificate uploaded and awaiting verification',
      certificateId: certId,
      fileHash
    });
  } catch (err) {
    console.error('certificate/upload error:', err);
    res.status(500).json({ error: 'Failed to upload certificate', details: err.message });
  }
});

// ── POST /api/certificate/approve/:certId ─────────────────────────────────────
/**
 * Institution approves a pending certificate and writes it to the Fabric ledger.
 *
 * Body (JSON):
 *   identity – the institution identity name in the Fabric wallet (e.g. "college_xyz")
 */
router.post('/approve/:certId', async (req, res) => {
  try {
    const { certId }   = req.params;
    const { identity } = req.body;

    if (!identity) {
      return res.status(400).json({ error: 'identity is required' });
    }

    const cert = await BlockchainCertificate.findOne({ certId });
    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    if (cert.status !== 'PENDING') {
      return res.status(400).json({ error: 'Certificate is not in PENDING state' });
    }
    if (identity !== cert.institution) {
      return res.status(403).json({ error: 'Unauthorized: identity does not match the issuing institution' });
    }

    await fabricNetwork.addCertificate(
      identity,
      cert.certId,
      cert.studentId,
      cert.studentName,
      cert.course,
      cert.institution,
      cert.grade,
      cert.issueDate.toISOString(),
      cert.fileHash
    );

    cert.status = 'VERIFIED';
    await cert.save();

    res.json({ success: true, message: 'Certificate verified and added to the blockchain' });
  } catch (err) {
    console.error('certificate/approve error:', err);
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

// ── POST /api/certificate/verify ──────────────────────────────────────────────
/**
 * Third-party verification: upload the original file to check authenticity.
 * 1. Compute hash of uploaded file.
 * 2. Look up the hash in MongoDB.
 * 3. If VERIFIED, also confirm against the blockchain ledger.
 *
 * Body (multipart/form-data):
 *   certificate – file
 *   identity    – optional string (defaults to 'college_xyz')
 */
router.post('/verify', upload.single('certificate'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Certificate file is required' });
    }

    const hash     = generateCertHash(file.buffer);
    const identity = req.body.identity || 'college_xyz';

    const cert = await BlockchainCertificate.findOne({ fileHash: hash });
    if (!cert) {
      return res.status(404).json({ verified: false, error: 'Certificate not found in the system' });
    }
    if (cert.status !== 'VERIFIED') {
      return res.status(400).json({ verified: false, error: 'Certificate has not been verified by an institution yet' });
    }

    const result = await fabricNetwork.queryCertificate(identity, cert.certId);
    res.json({ success: true, verified: true, certificate: JSON.parse(result) });
  } catch (err) {
    console.error('certificate/verify error:', err);
    res.status(500).json({ verified: false, error: 'Certificate verification failed', details: err.message });
  }
});

// ── GET /api/certificate/:certId ──────────────────────────────────────────────
/**
 * Query a certificate directly from the blockchain ledger.
 *
 * Query params:
 *   identity – optional, defaults to 'college_xyz'
 */
router.get('/:certId', async (req, res) => {
  try {
    const { certId }   = req.params;
    const identity     = req.query.identity || 'college_xyz';

    const result = await fabricNetwork.queryCertificate(identity, certId);
    res.json({ success: true, certificate: JSON.parse(result) });
  } catch (err) {
    console.error('certificate/get error:', err);
    res.status(404).json({ error: 'Certificate not found', details: err.message });
  }
});

export default router;
