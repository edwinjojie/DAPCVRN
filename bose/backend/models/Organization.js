import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  organizationId: {
    type: String,
    required: [true, 'Organization ID is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Organization type is required'],
    enum: {
      values: ['institution', 'company', 'government', 'ngo', 'other'],
      message: '{VALUE} is not a valid organization type'
    }
  },
  mspId: {
    type: String,
    required: [true, 'MSP ID is required'],
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: String,
  website: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  logo: String,
  description: String,
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  blockchainRegistered: {
    type: Boolean,
    default: false
  },
  blockchainTxId: String,
  adminContact: {
    name: String,
    email: String,
    phone: String
  },
  stats: {
    totalCredentialsIssued: { type: Number, default: 0 },
    totalMembers: { type: Number, default: 0 },
    totalVerifications: { type: Number, default: 0 }
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

organizationSchema.index({ organizationId: 1 });
organizationSchema.index({ mspId: 1 });
organizationSchema.index({ approved: 1 });
organizationSchema.index({ type: 1 });

organizationSchema.virtual('members', {
  ref: 'User',
  localField: '_id',
  foreignField: 'organizationId'
});

organizationSchema.virtual('credentialsIssued', {
  ref: 'Credential',
  localField: '_id',
  foreignField: 'institutionId'
});

organizationSchema.methods.approve = async function(adminUserId) {
  this.approved = true;
  this.approvedBy = adminUserId;
  this.approvedAt = new Date();
  return await this.save();
};

organizationSchema.statics.findApproved = function() {
  return this.find({ approved: true, isActive: true });
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;

