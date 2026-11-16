import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: '',
    trim: true
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  type: {
    type: String,
    enum: ['study', 'quiz', 'revision', 'other'],
    default: 'study'
  },

  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster range queries
eventSchema.index({ userId: 1, startDate: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;