import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: [true, 'Notification ID is required'],
    unique: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'credential_issued',
      'credential_verified',
      'credential_revoked',
      'job_posted',
      'application_received',
      'application_status_changed',
      'message_received',
      'interview_scheduled',
      'offer_received',
      'system',
      'other'
    ]
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  relatedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  relatedCredential: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credential'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actionUrl: String,
  actionText: String,
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  deliveryMethod: {
    type: String,
    enum: ['in-app', 'email', 'sms', 'push'],
    default: 'in-app'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
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

notificationSchema.index({ notificationId: 1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

notificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return await this.save();
  }
  return this;
};

notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    userId,
    isRead: false,
    isArchived: false
  });
};

notificationSchema.statics.createNotification = async function(data) {
  const notification = new this({
    notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...data
  });
  
  return await notification.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

