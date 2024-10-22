// backend/routes/loans.js

const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const User = require('../models/User');
const authenticateJWT = require('../middleware/authMiddleware');

// Get All Loans (Public)
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('lender', 'name email')    // Populate lender's name and email
      .populate('borrower', 'name email'); // Populate borrower's name and email
    res.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Loan (Lender offering money) - Protected
router.post('/offer', authenticateJWT, async (req, res) => {
  const { amount, duration, interestRate } = req.body;
  const lenderId = req.user._id; // Retrieved from middleware

  try {
    // Validate lender's role
    if (req.user.role !== 'Lender') {
      return res.status(403).json({ message: 'Forbidden: Only lenders can offer loans' });
    }

    // Validate input
    if (!amount || !duration || !interestRate) {
      return res.status(400).json({ message: 'All loan fields are required' });
    }

    // Create loan
    const loan = new Loan({
      amount,
      duration,
      interestRate,
      lender: lenderId,
      status: 'Approved' // Assuming immediate approval; adjust as needed
    });

    await loan.save();

    // Update lender's loan history
    req.user.loanHistory.push(loan._id);
    await req.user.save();

    res.status(201).json({ message: 'Loan offer created successfully', loan });
  } catch (error) {
    console.error('Error creating loan offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request Loan (Borrower requesting money) - Protected
router.post('/request', authenticateJWT, async (req, res) => {
  const { loanId } = req.body;
  const borrowerId = req.user._id; // Retrieved from middleware

  try {
    // Validate borrower's role
    if (req.user.role !== 'Borrower') {
      return res.status(403).json({ message: 'Forbidden: Only borrowers can request loans' });
    }

    // Validate input
    if (!loanId) {
      return res.status(400).json({ message: 'Loan ID is required' });
    }

    // Find the loan
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot request a loan with status "${loan.status}"` });
    }

    // Assign borrower to the loan and update status
    loan.borrower = borrowerId;
    loan.status = 'Approved'; // Change to 'Approved' or keep as 'Pending' based on business logic
    await loan.save();

    // Update borrower's loan history
    req.user.loanHistory.push(loan._id);
    await req.user.save();

    res.json({ message: 'Loan requested successfully', loan });
  } catch (error) {
    console.error('Error requesting loan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

