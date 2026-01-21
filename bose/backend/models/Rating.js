import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  raterId: {
    type: String,
    required: true
  },
  tenureMonths: {
    type: Number,
    required: true
  },
  performance: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  remarks: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
