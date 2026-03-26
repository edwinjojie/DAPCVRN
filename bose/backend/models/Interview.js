import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recruiter ID is required']
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate ID is required']
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: [true, 'Application ID is required']
  },
  title: {
    type: String,
    required: [true, 'Interview title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  location: {
    type: String,
    trim: true,
    default: 'Video Call'
  },
  meetingLink: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true
  },
  calendarEventId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

interviewSchema.index({ recruiterId: 1, startTime: 1 });
interviewSchema.index({ candidateId: 1, startTime: 1 });
interviewSchema.index({ jobId: 1 });
interviewSchema.index({ applicationId: 1 });

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;