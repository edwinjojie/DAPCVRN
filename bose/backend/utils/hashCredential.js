import crypto from 'crypto';

/**
 * Generates a SHA256 hash for a credential based on its core fields.
 * Implementation: SHA256(studentId + credentialName + institution + issueDate)
 * 
 * @param {string} studentId - The student's ID
 * @param {string} credentialName - The name of the credential
 * @param {string} institution - The issuing institution
 * @param {string|Date} issueDate - The date of issuance
 * @returns {string} The SHA256 hash hex string
 */
export const generateCredentialHash = (studentId, credentialName, institution, issueDate) => {
  const dateStr = new Date(issueDate).toISOString();
  const data = `${studentId}${credentialName}${institution}${dateStr}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};
