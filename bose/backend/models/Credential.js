import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema({
  credentialId: {
    type: String,
    required: [true, 'Credential ID is required'],
    unique: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  studentEmail: {
    type: String,
    required: [true, 'Student email is required'],
    lowercase: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Credential type is required'],
    enum: {
      values: ['degree', 'certificate', 'diploma', 'transcript', 'skill', 'achievement', 'other'],
      message: '{VALUE} is not a valid credential type'
    }
  },
  title: {
    type: String,
    required: [true, 'Credential title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  course: {
    type: String,
    default: null
  },
  institution: {
    type: String,
    required: [true, 'Institution is required'],
    trim: true
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  issuer: {
    type: String,
    required: [true, 'Issuer is required']
  },
  issuerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Issuer ID is required']
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  year: {
    type: Number,
    default: null
  },
  grade: {
    type: String,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'issued', 'verified', 'revoked', 'expired'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  blockchainTxId: {
    type: String,
    default: null,
    index: true
  },
  dataHash: {
    type: String,
    required: [true, 'Data hash is required'],
    index: true
  },
  blockchainTimestamp: {
    type: Date,
    default: null
  },
  organization: {
    type: String,
    required: [true, 'Organization MSP is required']
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verificationNotes: {
    type: String,
    default: null
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revocationReason: {
    type: String,
    default: null
  },
  skills: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
credentialSchema.index({ credentialId: 1 });
credentialSchema.index({ userId: 1 });
credentialSchema.index({ issuerId: 1 });
credentialSchema.index({ status: 1 });
credentialSchema.index({ type: 1 });
credentialSchema.index({ issueDate: -1 });
credentialSchema.index({ userId: 1, status: 1 });
credentialSchema.index({ institutionId: 1, status: 1 });

// Virtual for checking if credential is valid
credentialSchema.virtual('isValid').get(function() {
  if (this.status === 'revoked') return false;
  if (this.status === 'expired') return false;
  if (this.expiryDate && this.expiryDate < new Date()) return false;
  return true;
});

// Instance methods
credentialSchema.methods.revoke = async function(userId, reason) {
  this.status = 'revoked';
  this.revokedBy = userId;
  this.revokedAt = new Date();
  this.revocationReason = reason;
  return await this.save();
};

credentialSchema.methods.verify = async function(userId, notes) {
  this.status = 'verified';
  this.verifiedBy = userId;
  this.verifiedAt = new Date();
  this.verificationNotes = notes;
  return await this.save();
};

// Static methods
credentialSchema.statics.findByCredentialId = function(credentialId) {
  return this.findOne({ credentialId });
};

credentialSchema.statics.findActiveByUser = function(userId) {
  return this.find({ 
    userId, 
    status: { $in: ['issued', 'verified'] }
  }).sort({ issueDate: -1 });
};

const Credential = mongoose.model('Credential', credentialSchema);

export default Credential;

