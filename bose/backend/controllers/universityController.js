import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { Credential } from '../models/index.js';
import { generateCredentialHash } from '../utils/hashCredential.js';
import * as blockchainService from '../services/blockchainService.js';

/**
 * Controller for University/Institution specific actions
 */
export const issueCredential = async (req, res) => {
  try {
    // 1 Read request body
    const { studentId, credentialName, institution, degree, issueDate } = req.body;

    // 2 Validate fields
    const schema = Joi.object({
      studentId: Joi.string().required(),
      credentialName: Joi.string().required(),
      institution: Joi.string().required(),
      degree: Joi.string().required(),
      issueDate: Joi.date().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // 3 Generate credential hash
    const hash = generateCredentialHash(
      value.studentId,
      value.credentialName,
      value.institution,
      value.issueDate
    );

    // 4 Save credential to database
    const credentialId = uuidv4();
    const newCred = new Credential({
      credentialId,
      userId: req.user._id, // Assume current user issues it? No, studentId is the student.
      // In a real scenario, studentId should be a valid User ID from the DB.
      // For this phase, we'll store it in the newly added Phase 5 fields.
      studentId: value.studentId,
      credentialName: value.credentialName,
      institution: value.institution,
      title: value.credentialName, // compatibility
      type: 'degree', // default as per requirements
      course: value.degree,
      issueDate: value.issueDate,
      credentialHash: hash,
      dataHash: hash, // compatibility
      status: 'verified',
      createdBy: req.user._id,
      issuerId: req.user._id, // compatibility
      issuer: req.user.organization || value.institution, // compatibility
      studentName: 'Student Name TBD', // compatibility - ideally lookup by studentId
      studentEmail: 'student@example.com', // compatibility - ideally lookup by studentId
    });

    await newCred.save();

    // 5 Send transaction to blockchain
    let blockchainResult = { status: 'pending' };
    try {
      console.log(`Submitting direct issuance to blockchain for: ${value.credentialName}`);
      const bcResponse = await blockchainService.addCertificate({
        credentialId,
        studentId: value.studentId,
        institution: value.institution,
        credentialHash: hash,
        issueDate: value.issueDate
      });
      
      console.log('✅ Blockchain transaction successful');
      
      // 6 Save transaction id
      newCred.blockchainTxId = bcResponse.txId || hash; 
      await newCred.save();
      blockchainResult = { status: 'submitted', txId: bcResponse.txId || hash };
    } catch (bcError) {
      console.error('Blockchain submission failed for university issuance:', bcError);
      blockchainResult = { status: 'failed', error: bcError.message };
    }

    // 7 Return success
    res.status(201).json({
      success: true,
      message: 'Credential issued successfully',
      data: newCred,
      blockchain: blockchainResult
    });

  } catch (err) {
    console.error('Error in universityController.issueCredential:', err);
    res.status(500).json({ error: 'Internal server error while issuing credential' });
  }
};

export const getUniversityCredentials = async (req, res) => {
  try {
    const universityId = req.user._id;
    const credentials = await Credential.find({ createdBy: universityId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: credentials
    });
  } catch (err) {
    console.error('Error in getUniversityCredentials:', err);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
};
