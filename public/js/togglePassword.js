document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('account_password');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', function() {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleBtn.textContent = isPassword ? 'Hide Password' : 'Show Password';
    });
  }
});