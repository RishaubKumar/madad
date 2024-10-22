// frontend/js/auth.js

// Get DOM Elements
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');

const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');

const closeLogin = document.getElementById('close-login');
const closeSignup = document.getElementById('close-signup');

// Open Login Modal
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
  });
}

// Open Signup Modal
if (signupBtn) {
  signupBtn.addEventListener('click', () => {
    signupModal.style.display = 'block';
  });
}

// Close Login Modal
if (closeLogin) {
  closeLogin.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });
}

// Close Signup Modal
if (closeSignup) {
  closeSignup.addEventListener('click', () => {
    signupModal.style.display = 'none';
  });
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  if (e.target == loginModal) {
    loginModal.style.display = 'none';
  }
  if (e.target == signupModal) {
    signupModal.style.display = 'none';
  }
});

// Handle Signup Form Submission
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      alert(data.message);
      if (res.status === 201) {
        signupModal.style.display = 'none';
        // Optionally, open login modal
        loginModal.style.display = 'block';
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during signup. Please try again.');
    }
  });
}

// Handle Login Form Submission
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        // Save token and user info to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Update UI
        updateUIOnLogin(data.user);

        // Close modal
        loginModal.style.display = 'none';
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during login. Please try again.');
    }
  });
}

// Handle Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUIOnLogout();
    window.location.href = 'index.html';
  });
}

// Update UI After Login
function updateUIOnLogin(user) {
  const authButtons = document.getElementById('auth-buttons');
  const navLinks = document.getElementById('nav-links');

  if (authButtons) {
    authButtons.style.display = 'none';
  }

  if (logoutBtn) {
    logoutBtn.style.display = 'block';
  }

  // Show offer loan section if user is a lender
  if (user.role === 'Lender') {
    const offerLoanSection = document.getElementById('offer-loan-section');
    if (offerLoanSection) {
      offerLoanSection.style.display = 'block';
    }
  }
}

// Update UI After Logout
function updateUIOnLogout() {
  const authButtons = document.getElementById('auth-buttons');
  const navLinks = document.getElementById('nav-links');

  if (authButtons) {
    authButtons.style.display = 'block';
  }

  if (logoutBtn) {
    logoutBtn.style.display = 'none';
  }

  // Hide offer loan section
  const offerLoanSection = document.getElementById('offer-loan-section');
  if (offerLoanSection) {
    offerLoanSection.style.display = 'none';
  }
}

// Check Login Status on Page Load
window.onload = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    updateUIOnLogin(user);
  }

  // Check if redirected with hash to open modal
  if (window.location.hash === '#login') {
    loginModal.style.display = 'block';
  } else if (window.location.hash === '#signup') {
    signupModal.style.display = 'block';
  }
};
