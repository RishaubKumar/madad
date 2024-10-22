// backend/models/Loan.js

const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 100 // Minimum loan amount
  },
  duration: {
    type: Number,
    required: true,
    min: 1 // Minimum duration in months
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0 // Minimum interest rate
  },
  lender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Not required for loans requested by borrowers
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Not required for loans offered by lenders
  },
  status: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Loan', LoanSchema);

