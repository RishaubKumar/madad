// frontend/js/loan.js

// Handle Offer Loan Form Submission
const offerLoanForm = document.getElementById('offer-loan-form');
if (offerLoanForm) {
  offerLoanForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const duration = document.getElementById('duration').value;
    const interestRate = document.getElementById('interestRate').value;

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
      alert('Please log in to offer a loan.');
      return;
    }

    if (user.role !== 'Lender') {
      alert('Only lenders can offer loans.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/loans/offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include JWT token
        },
        body: JSON.stringify({ amount, duration, interestRate, lenderId: user._id })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Loan offer created successfully.');
        // Optionally, refresh loan listings
        fetchLoans();
        // Clear form
        offerLoanForm.reset();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error offering loan:', error);
      alert('An error occurred while offering the loan. Please try again.');
    }
  });
}
