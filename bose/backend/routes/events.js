import express from 'express';

const router = express.Router();

// Get recent events (simulation)
router.get('/', (req, res) => {
  const { limit = 50 } = req.query;
  
  // Mock event data
  const events = [
    {
      id: 'evt_001',
      type: 'CredentialIssued',
      credentialId: 'CRED_001',
      studentId: 'STUDENT_001',
      issuer: 'Org1MSP',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      blockNumber: 100,
      transactionId: 'tx_001'
    },
    {
      id: 'evt_002',
      type: 'CredentialVerified',
      credentialId: 'CRED_001',
      verifiedBy: 'Org2MSP',
      result: 'valid',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      blockNumber: 101,
      transactionId: 'tx_002'
    },
    {
      id: 'evt_003',
      type: 'CredentialRevoked',
      credentialId: 'CRED_002',
      reason: 'Administrative review',
      revokedBy: 'Org3MSP',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      blockNumber: 102,
      transactionId: 'tx_003'
    }
  ];

  // Generate more mock events
  for (let i = 4; i <= parseInt(limit); i++) {
    events.push({
      id: `evt_${String(i).padStart(3, '0')}`,
      type: ['CredentialIssued', 'CredentialVerified', 'CredentialRevoked'][i % 3],
      credentialId: `CRED_${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
      studentId: `STUDENT_${String(Math.floor(Math.random() * 50)).padStart(3, '0')}`,
      issuer: ['Org1MSP', 'Org2MSP', 'Org3MSP'][i % 3],
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      blockNumber: 50 + i,
      transactionId: `tx_${String(i).padStart(3, '0')}`
    });
  }

  res.json({
    success: true,
    events: events.slice(0, parseInt(limit)),
    totalCount: events.length
  });
});

export default router;