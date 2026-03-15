/**
 * Service to interact with the external blockchain REST API
 */
const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3002';

/**
 * Issue a new certificate transaction on the blockchain
 * 
 * @param {Object} data - The credential data
 * @param {string} data.credentialId - Unique identifier for the credential
 * @param {string} data.studentId - Student's unique identifier
 * @param {string} data.institution - Issuing institution name
 * @param {string} data.credentialHash - SHA256 hash of the credential data
 * @param {string|Date} data.issueDate - Date of issuance
 * @returns {Promise<Object>} The blockchain transaction result { txId }
 */
export const addCertificate = async (data) => {
  try {
    const response = await fetch(`${BLOCKCHAIN_SERVICE_URL}/certificate/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credentialId: data.credentialId,
        studentId: data.studentId,
        institution: data.institution,
        credentialHash: data.credentialHash,
        issueDate: new Date(data.issueDate).toISOString()
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Blockchain service error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return {
      txId: result.txId || result.transactionId || result.hash || result.data?.txId
    };
  } catch (error) {
    console.error('Error in blockchainService.addCertificate:', error);
    throw error;
  }
};

/**
 * Verify a credential on the blockchain
 * 
 * @param {string} credentialId - The ID of the credential to verify
 * @returns {Promise<Object>} The verification result
 */
export const verifyCredential = async (credentialId) => {
  try {
    const response = await fetch(`${BLOCKCHAIN_SERVICE_URL}/certificate/${credentialId}`);
    
    if (!response.ok) {
      if (response.status === 404) return { verified: false, message: 'Not found on blockchain' };
      throw new Error(`Blockchain service error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in blockchainService.verifyCredential:', error);
    throw error;
  }
};

/**
 * Revoke a certificate on the blockchain
 * 
 * @param {Object} data - Revocation data
 * @param {string} data.credentialId - The ID of the credential to revoke
 * @param {string} data.reason - Reason for revocation
 * @returns {Promise<Object>} The revocation result
 */
export const revokeCertificate = async (data) => {
  try {
    const response = await fetch(`${BLOCKCHAIN_SERVICE_URL}/certificate/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Blockchain service error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in blockchainService.revokeCertificate:', error);
    throw error;
  }
};

export default {
  addCertificate,
  verifyCredential,
  revokeCertificate
};
