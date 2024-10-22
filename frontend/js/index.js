// frontend/js/index.js

// Fetch and Display Loans
async function fetchLoans() {
  try {
    const res = await fetch('http://localhost:5000/api/loans');
    const loans = await res.json();

    const loanList = document.getElementById('loan-list');
    loanList.innerHTML = ''; // Clear existing loans

    if (loans.length === 0) {
      loanList.innerHTML = '<p>No loans available at the moment.</p>';
      return;
    }

    loans.forEach(loan => {
      const loanCard = document.createElement('div');
      loanCard.classList.add('loan-card');

      // Determine the role and display relevant information
      let loanDetails = `
        <h3>$${loan.amount}</h3>
        <p><strong>Duration:</strong> ${loan.duration} months</p>
        <p><strong>Interest Rate:</strong> ${loan.interestRate}%</p>
        <p><strong>Status:</strong> <span class="status">${loan.status}</span></p>
      `;

      // Display lender or borrower based on loan type
      if (loan.lender) {
        loanDetails += `<p><strong>Lender:</strong> ${loan.lender.name}</p>`;
      }
      if (loan.borrower) {
        loanDetails += `<p><strong>Borrower:</strong> ${loan.borrower.name}</p>`;
      }

      // Add "Request Loan" button if the loan is pending and user is a borrower
      if (loan.status === 'Pending' && isBorrower()) {
        loanDetails += `<button class="request-loan" data-loan-id="${loan._id}">Request Loan</button>`;
      }

      loanCard.innerHTML = loanDetails;

      loanList.appendChild(loanCard);
    });

    // Add event listeners to request loan buttons
    const requestButtons = document.querySelectorAll('.request-loan');
    requestButtons.forEach(button => {
      button.addEventListener('click', () => {
        const loanId = button.getAttribute('data-loan-id');
        requestLoan(loanId);
      });
    });

    console.log(`Fetched and displayed ${loans.length} loans.`);
  } catch (error) {
    console.error('Error fetching loans:', error);
    const loanList = document.getElementById('loan-list');
    loanList.innerHTML = '<p>Error fetching loans. Please try again later.</p>';
  }
}

// Determine if the user is a borrower
function isBorrower() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'Borrower';
}

// Handle Loan Request
async function requestLoan(loanId) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!user || !token) {
    alert('Please log in to request a loan.');
    return;
  }

  if (user.role !== 'Borrower') {
    alert('Only borrowers can request loans.');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/loans/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Include JWT token
      },
      body: JSON.stringify({ loanId, borrowerId: user._id })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Loan requested successfully.');
      fetchLoans(); // Refresh loan listings
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error requesting loan:', error);
    alert('An error occurred while requesting the loan. Please try again.');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchLoans);

