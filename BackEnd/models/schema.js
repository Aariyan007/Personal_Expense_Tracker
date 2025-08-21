const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    monthlyIncome: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: 'USD'
    },
    primaryGoal: {
        type: String,
        required: true
    },
    budgetPreference: {
        type: String,
        required: true
    },
    expenseCategories: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserData', userDataSchema);
