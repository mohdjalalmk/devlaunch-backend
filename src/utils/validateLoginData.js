const validator = require('validator');

function validateLoginData(email, password) {
  if (!email || !password) {
    throw new Error('Invalid email or password');
  }

  if (!validator.isEmail(email)) {
    throw new Error('Invalid email or password');
  }
}

module.exports = { validateLoginData };
