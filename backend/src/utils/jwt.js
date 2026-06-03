const jwt = require('jsonwebtoken');

// generateToken creates a new token for a user after login/register
// userId is the MongoDB _id of the user
const generateToken = (userId) => {
  return jwt.sign(
    { userId },                          // PAYLOAD: data stored inside the token
    process.env.JWT_SECRET,              // SECRET: a private key only your server knows
    { expiresIn: '7d' }                  // OPTIONS: token expires in 7 days
  );
};

// verifyToken checks if a token is valid and not expired
const verifyToken = (token) => {
  try {
    // jwt.verify returns the payload if valid, throws error if not
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = { generateToken, verifyToken };