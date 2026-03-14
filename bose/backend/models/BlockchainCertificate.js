import mongoose from 'mongoose';

/**
 * BlockchainCertificate – tracks certificate state between MongoDB and the
 * Hyperledger Fabric ledger.  A certificate starts as PENDING after a student
 * uploads the file; it becomes VERIFIED once an institution calls the approve
 * endpoint and the chaincode transaction succeeds.
 */
const blockchainCertificateSchema = new mongoose.Schema(
  {
    certId:       { type: String, required: true, unique: true },
    studentId:    { type: String, required: true },
    studentName:  { type: String, required: true },
    course:       { type: String, required: true },
    institution:  { type: String, required: true },
    grade:        { type: String },
    issueDate:    { type: Date,   required: true },
    fileHash:     { type: String, required: true },   // SHA-256 of uploaded file
    blockchainId: { type: String },                   // tx ID after on-chain write
    status: {
      type:    String,
      enum:    ['PENDING', 'VERIFIED', 'FAILED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

const BlockchainCertificate = mongoose.model('BlockchainCertificate', blockchainCertificateSchema);
export default BlockchainCertificate;
