const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This is a middleware function - it runs BETWEEN the request arriving
// and your route handler running
// Think of it as a security guard at the door

const auth = async (req, res, next) => {
  try {
    // 1. Read the Authorization header from the request
    // It looks like: "Bearer eyJhbGciOiJIUzI1NiJ9..."
    const authHeader = req.header('Authorization');

    // 2. Check the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, access denied' });
    }

    // 3. Extract just the token part (remove "Bearer ")
    const token = authHeader.replace('Bearer ', '');

    // 4. Verify the token using our secret key
    // If token is fake or expired, jwt.verify throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { userId: "64abc123...", iat: ..., exp: ... }

    // 5. Find the user in the database using the userId from the token
    // .select('-password') means "get all fields EXCEPT password"
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 6. Attach the user to the request object
    // Now any route that uses this middleware can access req.user
    req.user = user;

    // 7. Call next() to move on to the actual route handler
    next();

  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { auth };