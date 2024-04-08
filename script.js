function showSignupForm() {
    var loginForm = document.querySelector('.log-in');
    var signupForm = document.querySelector('.sign-up');
  
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
  }
function showLoginForm() {
    var loginForm = document.querySelector('.log-in');
    var signupForm = document.querySelector('.sign-up');
  
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
  }