const validator = require('validator');

function validateSignUpData(name, email, password) {
  // Basic presence check
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required.');
  }

  // Validate name
  if (name.length < 2 || name.length > 50) {
    throw new Error('Name must be between 2 and 50 characters.');
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    throw new Error('Name can only contain letters and spaces.');
  }

  // Validate email
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email address.');
  }

  // Validate password strength
  if (!validator.isStrongPassword(password)) {
    throw new Error(
      'Password must include uppercase, lowercase, number, and special character.'
    );
  }
}

module.exports = { validateSignUpData };
