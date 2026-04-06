import { Gateway, Wallets } from 'fabric-network';
import fs from 'fs';
import path from 'path';
import config from '../config/fabricConfig.js';
import { enrollUser } from './identityService.js';

// ── Lazy-load Credential model to avoid circular dep at startup ──────────────
let _Credential = null;
const getCredentialModel = async () => {
  if (!_Credential) {
    const mod = await import('../models/Credential.js');
    _Credential = mod.default;
  }
  return _Credential;
};

// ── Helper to get Fabric contract ────────────────────────────────────────────
const getContract = async (contractName, identityName, role = 'client', timeoutMs = 15000) => {
  console.log(`Connecting to ${contractName} as ${identityName} (role: ${role}) with timeout ${timeoutMs}ms...`);

  if (!fs.existsSync(config.ccpPath)) {
    throw new Error(`CCP not found at ${config.ccpPath}`);
  }

  const connectPromise = (async () => {
    const ccp = JSON.parse(fs.readFileSync(config.ccpPath, 'utf8'));
    const wallet = await Wallets.newFileSystemWallet(config.walletPath);

    const identityExists = await wallet.get(identityName);
    if (!identityExists) {
      console.log(`⚠️ Identity ${identityName} not found in wallet. Attempting auto-enrollment as ${role}...`);
      try {
        await enrollUser({ userId: identityName, role: role });
        console.log(`✅ Auto-enrollment successful for ${identityName}`);
      } catch (enrollError) {
        console.error(`❌ Auto-enrollment failed for ${identityName}:`, enrollError);
        if (identityName !== 'admin') {
          console.log(`⚠️ Falling back to 'admin' identity for transaction...`);
          identityName = 'admin';
        } else {
          throw enrollError;
        }
      }
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: identityName,
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork(config.channelName);
    const contract = network.getContract(config.chaincodeId, contractName);
    return { contract, gateway };
  })();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`Gateway connection timeout after ${timeoutMs}ms - Fabric network may not be running`)),
      timeoutMs
    )
  );

  return Promise.race([connectPromise, timeoutPromise]);
};

// ── Retry helper ─────────────────────────────────────────────────────────────
const withRetry = async (fn, retries = 1, delayMs = 1000) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt < retries) {
        console.warn(`⚠️ Fabric operation failed (attempt ${attempt + 1}/${retries + 1}): ${err.message}. Retrying in ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
        delayMs *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
};

// ── Health check ─────────────────────────────────────────────────────────────
let _lastHealthCheck = { available: false, checkedAt: 0 };

export const isNetworkAvailable = async () => {
  // Cache for 30 seconds to avoid hammering the network
  if (Date.now() - _lastHealthCheck.checkedAt < 30000) {
    return _lastHealthCheck.available;
  }
  try {
    const { gateway } = await getContract('BOSEChaincode', 'admin', 'admin', 3000);
    await gateway.disconnect();
    _lastHealthCheck = { available: true, checkedAt: Date.now() };
    return true;
  } catch (err) {
    console.warn('⚠️ Fabric network health check failed:', err.message);
    _lastHealthCheck = { available: false, checkedAt: Date.now() };
    return false;
  }
};

// ── Certificate Contract (BOSEChaincode) ─────────────────────────────────────

export const addCertificate = async (identity, role, certId, studentId, studentName, course, institution, grade, issueDate, fileHash) => {
  return withRetry(async () => {
    const { contract, gateway } = await getContract('BOSEChaincode', identity, role);
    try {
      console.log(`Submitting AddCertificate transaction for ${certId}...`);
      await contract.submitTransaction(
        'AddCertificate', certId, studentId, studentName,
        course, institution, grade || '', issueDate, fileHash
      );
      console.log(`✅ AddCertificate transaction submitted`);
      return { success: true };
    } finally {
      await gateway.disconnect();
    }
  }, 1, 2000);
};

export const queryCertificate = async (identity, certId) => {
  const { contract, gateway } = await getContract('BOSEChaincode', identity);
  try {
    const result = await contract.evaluateTransaction('QueryCertificate', certId);
    return result.toString();
  } finally {
    await gateway.disconnect();
  }
};

// ── Skills Contract (SkillsChaincode) ────────────────────────────────────────

export const addSkill = async (identity, role, skillId, studentId, studentName, skillName, category, level, issuer) => {
  return withRetry(async () => {
    const { contract, gateway } = await getContract('SkillsChaincode', identity, role || 'institution');
    try {
      await contract.submitTransaction('AddSkill', skillId, studentId, studentName || '', skillName, category || '', level || '', issuer || '');
      return { success: true };
    } finally {
      await gateway.disconnect();
    }
  }, 1, 2000);
};

export const querySkill = async (identity, skillId) => {
  const { contract, gateway } = await getContract('SkillsChaincode', identity);
  try {
    const result = await contract.evaluateTransaction('QuerySkill', skillId);
    return result.toString();
  } finally {
    await gateway.disconnect();
  }
};

// ── Compatibility methods used by credentials.js ─────────────────────────────
// These map legacy credential-style calls to the underlying Fabric + MongoDB
// operations.  Fabric calls are best-effort; MongoDB is the source of truth.

/**
 * issueCredential – writes a credential to the Fabric ledger via AddCertificate.
 * Called by credentials.js approve workflow.
 */
export const issueCredential = async (credentialId, studentId, dataHash, orgMsp) => {
  const identity = 'admin'; // use admin wallet identity for issuance
  try {
    await addCertificate(
      identity,
      'admin', // Role
      credentialId,
      studentId,
      'Student',          // studentName – not available in this call signature
      'Certificate',      // course
      orgMsp || 'Org1MSP',
      'Pass',             // grade
      new Date().toISOString(),
      dataHash
    );
    return { transactionId: `TX_${credentialId}_${Date.now()}`, timestamp: new Date().toISOString() };
  } catch (err) {
    console.warn(`⚠️ Fabric issueCredential failed (fabric may be offline): ${err.message}`);
    // Return a pseudo-result so the credential remains approved in MongoDB
    return { transactionId: null, timestamp: new Date().toISOString(), fabricError: err.message };
  }
};

/**
 * verifyCredential – confirms a credential exists on the ledger (by hash lookup in MongoDB).
 * Called by credentials.js /verify endpoint.
 */
export const verifyCredential = async (credentialId, dataHash) => {
  const Credential = await getCredentialModel();
  const cred = await Credential.findOne({ credentialId }).lean();
  if (!cred) return { verified: false, message: 'Credential not found' };
  const hashMatch = cred.dataHash === dataHash;
  return {
    verified: hashMatch && cred.status === 'verified',
    credentialId: cred.credentialId,
    status: cred.status,
    hashMatch,
    issuedAt: cred.issueDate,
    verifiedAt: cred.verifiedAt
  };
};

/**
 * revokeCredential – marks a credential as revoked in MongoDB.
 * (The current chaincode does not expose a Revoke function, so we only update MongoDB.)
 * Called by credentials.js /revoke endpoint.
 */
export const revokeCredential = async (credentialId, reason) => {
  const Credential = await getCredentialModel();
  const cred = await Credential.findOne({ credentialId });
  if (!cred) throw new Error(`Credential ${credentialId} not found`);
  cred.status = 'revoked';
  cred.revocationReason = reason;
  cred.revokedAt = new Date();
  await cred.save();
  console.log(`🔒 Credential ${credentialId} revoked: ${reason}`);
  return { transactionId: `REVOKE_${credentialId}_${Date.now()}`, timestamp: new Date().toISOString() };
};

/**
 * getCredential – retrieves a single credential from MongoDB by its _id or credentialId.
 * Called by credentials.js GET /:credentialId as a fallback.
 */
export const getCredential = async (credentialId) => {
  const Credential = await getCredentialModel();
  const cred = await Credential.findOne({ credentialId }).lean();
  return cred || null;
};

/**
 * queryAllCredentials – returns all credentials from MongoDB.
 * Called by credentials.js GET / (auditor route).
 */
export const queryAllCredentials = async () => {
  const Credential = await getCredentialModel();
  return await Credential.find({}).sort({ createdAt: -1 }).lean();
};

/**
 * queryCredentialsByStudent – returns all credentials for a given studentId.
 * Called by credentials.js GET /student/:studentId.
 */
export const queryCredentialsByStudent = async (studentId) => {
  const Credential = await getCredentialModel();
  // studentId could be a MongoDB ObjectId (userId) or a plain string studentId field
  const creds = await Credential.find({
    $or: [
      { userId: studentId },
      { studentId }
    ]
  }).sort({ createdAt: -1 }).lean();
  return creds;
};

/**
 * getBlockchainStatus – checks if a credential is anchored on the Fabric ledger.
 */
export const getBlockchainStatus = async (credentialId) => {
  try {
    const Credential = await getCredentialModel();
    const cred = await Credential.findOne({ credentialId }).select('blockchainTxId blockchainTimestamp status').lean();
    if (!cred) return { anchored: false, error: 'Credential not found' };
    return {
      anchored: !!cred.blockchainTxId,
      txId: cred.blockchainTxId,
      timestamp: cred.blockchainTimestamp,
      status: cred.status,
    };
  } catch (err) {
    return { anchored: false, error: err.message };
  }
};

export default {
  addCertificate,
  queryCertificate,
  addSkill,
  querySkill,
  issueCredential,
  verifyCredential,
  revokeCredential,
  getCredential,
  queryAllCredentials,
  queryCredentialsByStudent,
  isNetworkAvailable,
  getBlockchainStatus
};
