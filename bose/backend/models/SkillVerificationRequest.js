import mongoose from 'mongoose';

/**
 * SkillVerificationRequest – mirrors VerificationRequest but for skills.
 * When a student requests institution verification for a declared skill,
 * a record is created here. The verifier (university) can approve or reject.
 */
const skillVerificationRequestSchema = new mongoose.Schema({
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlockchainSkill',
    required: true
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verifierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

skillVerificationRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const SkillVerificationRequest = mongoose.model('SkillVerificationRequest', skillVerificationRequestSchema);

export default SkillVerificationRequest;
