import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root of the repository (bose folder)
const projectRoot = path.resolve(__dirname, '..', '..');

export default {
  channelName: process.env.FABRIC_CHANNEL || 'mychannel',
  chaincodeId: process.env.FABRIC_CHAINCODE_ID || 'bose',
  chaincodes: {
    certificate: 'BOSEChaincode',
    skill: 'SkillsChaincode'
  },
  org: {
    mspId: process.env.FABRIC_MSP || 'Org1MSP',
    affiliation: process.env.FABRIC_AFFILIATION || 'org1.department1'
  },
  // Wallet stored in blockchain-services-new/wallet
  walletPath: path.resolve(projectRoot, 'blockchain-services-new', 'wallet'),
  // CCP path in blockchain-services-new/fabric-samples/...
  ccpPath: process.env.FABRIC_CCP_PATH || path.resolve(
    projectRoot,
    'blockchain-services-new',
    'fabric-samples',
    'test-network',
    'organizations',
    'peerOrganizations',
    'org1.example.com',
    'connection-org1.json'
  )
};
