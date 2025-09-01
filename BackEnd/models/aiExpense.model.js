const mongoose = require('mongoose');

const expenseModelSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense'
  },
  // AI Processing Fields
  originalText: {
    type: String,
    default: null
  },
  merchant: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null  
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Digital', 'Unknown'],
    default: 'Unknown'
  },
  tags: [{
    type: String
  }],
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1.0
  },
  aiProcessed: {
    type: Boolean,
    default: false
  },
  suggestions: [{
    type: String
  }],
  // Additional AI fields
  aiCategory: {
    type: String,
    default: null
  },
  aiAmount: {
    type: Number,
    default: null
  },
  aiDescription: {
    type: String,
    default: null
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingErrors: [{
    type: String
  }],
  lastProcessedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
expenseModelSchema.index({ userId: 1, date: -1 });
expenseModelSchema.index({ userId: 1, category: 1 });
expenseModelSchema.index({ userId: 1, aiProcessed: 1 });
expenseModelSchema.index({ userId: 1, processingStatus: 1 });

// Virtual for AI confidence level
expenseModelSchema.virtual('confidenceLevel').get(function() {
  if (this.confidence >= 0.8) return 'high';
  if (this.confidence >= 0.6) return 'medium';
  return 'low';
});

// Method to mark as AI processed
expenseModelSchema.methods.markAsAIProcessed = function() {
  this.aiProcessed = true;
  this.processingStatus = 'completed';
  this.lastProcessedAt = new Date();
  return this.save();
};

// Method to update processing status
expenseModelSchema.methods.updateProcessingStatus = function(status, errors = []) {
  this.processingStatus = status;
  if (errors.length > 0) {
    this.processingErrors = errors;
  }
  if (status === 'completed') {
    this.lastProcessedAt = new Date();
  }
  return this.save();
};

// Static method to find AI processed expenses
expenseModelSchema.statics.findAIProcessed = function(userId) {
  return this.find({ userId, aiProcessed: true });
};

// Static method to find pending AI processing
expenseModelSchema.statics.findPendingAIProcessing = function(userId) {
  return this.find({ userId, processingStatus: 'pending' });
};

// Static method to get dataset statistics
expenseModelSchema.statics.getDatasetStats = async function(userId) {
  const pipeline = [
    { $match: { userId: userId } },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' },
        totalAmount: { $sum: '$amount' },
        categoryCount: { $addToSet: '$category' }
      }
    },
    {
      $project: {
        _id: 0,
        totalEntries: 1,
        avgConfidence: 1,
        totalAmount: 1,
        uniqueCategories: { $size: '$categoryCount' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || { totalEntries: 0, avgConfidence: 0, totalAmount: 0, uniqueCategories: 0 };
};

module.exports = mongoose.model('ExpenseModel', expenseModelSchema);