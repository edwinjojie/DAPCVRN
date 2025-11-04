import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  nationality: String,
  phone: String,
  alternateEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  headline: {
    type: String,
    trim: true
  },
  bio: String,
  currentPosition: String,
  currentCompany: String,
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  skills: [{
    name: { type: String, required: true },
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: { type: Number, default: 0 },
    verified: { type: Boolean, default: false }
  }],
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    grade: String,
    description: String,
    current: { type: Boolean, default: false }
  }],
  experience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: String,
    startDate: { type: Date, required: true },
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
    achievements: [String]
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String
  }],
  projects: [{
    title: { type: String, required: true },
    description: String,
    url: String,
    startDate: Date,
    endDate: Date,
    technologies: [String],
    current: { type: Boolean, default: false }
  }],
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    portfolio: String,
    other: [{ 
      platform: String, 
      url: String 
    }]
  },
  preferences: {
    jobType: [{ 
      type: String, 
      enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary']
    }],
    workLocation: [{ 
      type: String, 
      enum: ['onsite', 'remote', 'hybrid']
    }],
    desiredSalary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    },
    willingToRelocate: { type: Boolean, default: false },
    availableFrom: Date
  },
  privacy: {
    profileVisibility: { 
      type: String, 
      enum: ['public', 'private', 'connections-only'],
      default: 'public'
    },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    allowMessages: { type: Boolean, default: true }
  },
  resume: {
    filename: String,
    url: String,
    uploadedAt: Date
  },
  completeness: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
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

profileSchema.index({ userId: 1 });

profileSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

profileSchema.methods.calculateCompleteness = function() {
  let score = 0;
  if (this.firstName && this.lastName && this.dateOfBirth) score += 20;
  if (this.phone && this.address.city) score += 10;
  if (this.headline && this.bio) score += 15;
  if (this.skills.length >= 3) score += 15;
  if (this.education.length > 0) score += 15;
  if (this.experience.length > 0) score += 15;
  if (this.resume.url) score += 10;
  
  this.completeness = score;
  return score;
};

profileSchema.pre('save', function(next) {
  this.calculateCompleteness();
  next();
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;

