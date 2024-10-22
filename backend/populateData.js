// backend/populateData.js

require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');
const Loan = require('./models/Loan');
const bcrypt = require('bcryptjs');

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for data population'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Function to generate random loan data
function generateRandomLoan(amountRange, durationRange, interestRateRange, lender, borrower, status) {
  const amount = Math.floor(Math.random() * (amountRange.max - amountRange.min + 1)) + amountRange.min;
  const duration = Math.floor(Math.random() * (durationRange.max - durationRange.min + 1)) + durationRange.min;
  const interestRate = (Math.random() * (interestRateRange.max - interestRateRange.min) + interestRateRange.min).toFixed(2);

  return new Loan({
    amount,
    duration,
    interestRate,
    lender: lender ? lender._id : null,
    borrower: borrower ? borrower._id : null,
    status,
  });
}

async function populate() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Loan.deleteMany({});

    // Create Users with hashed passwords
    const hashedPassword = await bcrypt.hash('password123', 10);

    const lender = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'Lender',
    });

    const borrower = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword,
      role: 'Borrower',
    });

    await lender.save();
    await borrower.save();

    // Create Loans Offered by Lender
    const loanOfferStatuses = ['Approved', 'Pending', 'Rejected'];
    const loansOffered = [];
    for (let i = 1; i <= 6; i++) {
      const status = loanOfferStatuses[Math.floor(Math.random() * loanOfferStatuses.length)];
      const loan = generateRandomLoan(
        { min: 1000, max: 10000 }, // amountRange
        { min: 6, max: 24 },      // durationRange
        { min: 3, max: 15 },      // interestRateRange
        lender,
        null,                      // No borrower for offered loans
        status
      );
      loansOffered.push(loan);
      await loan.save();

      // Update Lender's Loan History
      lender.loanHistory.push(loan._id);
    }

    // Create Loans Requested by Borrower
    const loanRequestStatuses = ['Approved', 'Pending', 'Rejected'];
    const loansRequested = [];
    for (let i = 1; i <= 6; i++) {
      const status = loanRequestStatuses[Math.floor(Math.random() * loanRequestStatuses.length)];
      const loan = generateRandomLoan(
        { min: 500, max: 5000 },  // amountRange
        { min: 3, max: 12 },      // durationRange
        { min: 5, max: 20 },      // interestRateRange
        null,                      // No lender for requested loans
        borrower,
        status
      );
      loansRequested.push(loan);
      await loan.save();

      // Update Borrower's Loan History
      borrower.loanHistory.push(loan._id);
    }

    await lender.save();
    await borrower.save();

    console.log('Database populated with fake data (2 users and 12 loans)');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    mongoose.connection.close();
  }
}

populate();

