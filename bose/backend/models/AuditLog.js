import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminName: String,
  action: {
    type: String,
    required: true,
    enum: [
      'APPROVE_ORG', 'REJECT_ORG', 'SUSPEND_ORG', 'REACTIVATE_ORG',
      'BAN_USER', 'UNBAN_USER', 'ROLE_CHANGE',
      'REVOKE_CREDENTIAL', 'MANUAL_VERIFY', 'RETRY_BLOCKCHAIN'
    ]
  },
  targetType: {
    type: String,
    required: true,
    enum: ['ORGANIZATION', 'USER', 'CREDENTIAL']
  },
  targetId: {
    type: String,
    required: true
  },
  targetName: String,
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  reason: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String
}, { timestamps: true });

export default mongoose.model('AuditLog', AuditLogSchema);
