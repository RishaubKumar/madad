// frontend/js/profile.js

// Fetch and Display User Profile
async function fetchUserProfile() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!user || !token) {
    alert('Please log in to view your profile.');
    window.location.href = 'index.html';
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch user profile.');
    }

    const data = await res.json();

    // Display User Details
    const profileDetails = document.getElementById('profile-details');
    profileDetails.innerHTML = `
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Role:</strong> ${data.role}</p>
    `;

    // Display Loan History
    const loanHistory = document.getElementById('loan-history');
    loanHistory.innerHTML = '<h3>Loan History</h3>';

    if (data.loanHistory.length === 0) {
      loanHistory.innerHTML += '<p>No loan history available.</p>';
      return;
    }

    data.loanHistory.forEach(loan => {
      const loanItem = document.createElement('div');
      loanItem.classList.add('loan-item');

      loanItem.innerHTML = `
        <p><strong>Amount:</strong> $${loan.amount}</p>
        <p><strong>Duration:</strong> ${loan.duration} months</p>
        <p><strong>Interest Rate:</strong> ${loan.interestRate}%</p>
        <p><strong>Status:</strong> ${loan.status}</p>
        <p><strong>Lender:</strong> ${loan.lender ? loan.lender.name : 'N/A'}</p>
        <p><strong>Borrower:</strong> ${loan.borrower ? loan.borrower.name : 'N/A'}</p>
      `;

      loanHistory.appendChild(loanItem);
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    alert('An error occurred while fetching your profile. Please try again.');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchUserProfile);
