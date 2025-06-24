const jwt = require('jsonwebtoken');


const JWT_SECRET = "dev-luanch-secret"

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '1d', // token valid for 7 days
  });
};

module.exports = { generateToken };
