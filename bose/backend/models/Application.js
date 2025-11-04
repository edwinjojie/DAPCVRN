import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: [true, 'Application ID is required'],
    unique: true,
    trim: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate ID is required']
  },
  candidateName: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true
  },
  candidateEmail: {
    type: String,
    required: [true, 'Candidate email is required'],
    lowercase: true,
    trim: true
  },
  coverLetter: String,
  resume: {
    filename: String,
    url: String,
    uploadedAt: Date
  },
  attachedCredentials: [{
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credential'
    },
    credentialTitle: String,
    verified: Boolean
  }],
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'under-review', 'shortlisted', 'interviewed', 'offered', 'accepted', 'rejected', 'withdrawn'],
    default: 'submitted'
  },
  timeline: [{
    status: String,
    timestamp: Date,
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  interviews: [{
    scheduledAt: Date,
    type: { 
      type: String, 
      enum: ['phone', 'video', 'in-person', 'technical', 'hr']
    },
    interviewer: String,
    notes: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled']
    }
  }],
  employerNotes: String,
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  offer: {
    salary: Number,
    currency: { type: String, default: 'USD' },
    startDate: Date,
    benefits: [String],
    offeredAt: Date,
    expiresAt: Date
  },
  rejectionReason: String,
  rejectedAt: Date,
  withdrawnAt: Date,
  withdrawalReason: String,
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

applicationSchema.index({ applicationId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

applicationSchema.methods.updateStatus = async function(newStatus, userId, notes) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    notes: notes || '',
    updatedBy: userId
  });
  return await this.save();
};

applicationSchema.methods.reject = async function(reason, userId) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.rejectedAt = new Date();
  this.timeline.push({
    status: 'rejected',
    timestamp: new Date(),
    notes: reason,
    updatedBy: userId
  });
  return await this.save();
};

const Application = mongoose.model('Application', applicationSchema);

export default Application;

