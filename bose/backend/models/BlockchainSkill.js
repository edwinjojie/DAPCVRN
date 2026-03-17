import mongoose from 'mongoose';

/**
 * BlockchainSkill – tracks skill records between MongoDB and the
 * Hyperledger Fabric ledger. A skill starts as PENDING after an add
 * request; it becomes ADDED once the chaincode transaction succeeds.
 */
const blockchainSkillSchema = new mongoose.Schema(
  {
    skillId:     { type: String, required: true, unique: true },
    studentId:   { type: String, required: true },
    studentName: { type: String, default: '' },
    skillName:   { type: String, required: true },
    category:    { type: String, default: '' },
    level:       { type: String, default: '' },
    issuer:      { type: String, default: '' },
    status: {
      type:    String,
      enum:    ['PENDING', 'ADDED', 'FAILED'],
      default: 'PENDING'
    },
    errorMessage: { type: String, default: null }  // populated when FAILED
  },
  { timestamps: true }
);

const BlockchainSkill = mongoose.model('BlockchainSkill', blockchainSkillSchema);
export default BlockchainSkill;
