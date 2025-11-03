import fabricNetwork from './fabricNetwork.js';

export async function initializeDemoData() {
  console.log('🎭 Initializing demo data...');
  
  try {
    // Simulate some initial credentials being issued
    const demoCredentials = [
      {
        studentId: 'STUDENT_001',
        dataHash: 'a1b2c3d4e5f67890123456789abcdef0',
        type: 'Bachelor Degree',
        issuer: 'Org1MSP'
      },
      {
        studentId: 'STUDENT_002',
        dataHash: 'b2c3d4e5f67890123456789abcdef01a',
        type: 'Master Degree',
        issuer: 'Org1MSP'
      },
      {
        studentId: 'STUDENT_003',
        dataHash: 'c3d4e5f67890123456789abcdef01ab2',
        type: 'Professional Certificate',
        issuer: 'Org2MSP'
      }
    ];

    // In a real implementation, these would be actual blockchain transactions
    console.log(`✅ Demo data initialized with ${demoCredentials.length} sample credentials`);
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing demo data:', error);
    return false;
  }
}