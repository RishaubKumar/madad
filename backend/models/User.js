// backend/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Lender', 'Borrower'],
    required: true
  },
  loanHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);

