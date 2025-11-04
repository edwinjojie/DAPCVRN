import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: [true, 'Job ID is required'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer ID is required']
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: String,
  responsibilities: String,
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  locationType: {
    type: String,
    enum: ['onsite', 'remote', 'hybrid'],
    default: 'onsite'
  },
  employmentType: {
    type: String,
    required: [true, 'Employment type is required'],
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary']
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'entry'
  },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    period: { 
      type: String, 
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly' 
    }
  },
  skills: [String],
  requiredCredentials: [String],
  benefits: [String],
  category: String,
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'closed', 'filled', 'cancelled'],
    default: 'draft'
  },
  applicationDeadline: Date,
  startDate: Date,
  totalApplications: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  requiresVerifiedCredentials: {
    type: Boolean,
    default: false
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

jobSchema.index({ jobId: 1 });
jobSchema.index({ employerId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ status: 1, createdAt: -1 });

jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'jobId'
});

jobSchema.virtual('isExpired').get(function() {
  if (!this.applicationDeadline) return false;
  return this.applicationDeadline < new Date();
});

jobSchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  return await this.save();
};

jobSchema.methods.close = async function() {
  this.status = 'closed';
  return await this.save();
};

jobSchema.statics.findActive = function() {
  return this.find({ 
    status: 'active',
    $or: [
      { applicationDeadline: null },
      { applicationDeadline: { $gte: new Date() } }
    ]
  }).sort({ createdAt: -1 });
};

const Job = mongoose.model('Job', jobSchema);

export default Job;

