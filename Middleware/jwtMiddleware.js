const jwt = require('jsonwebtoken');

// Middleware for verifying JWT
async function verify_jwt(req, res, next) {
  try {
    // Get the token from the request header
    // const token = req.headers['authorization'];
    const token = req.headers['authorization']?.split(' ')[1];


    
    if (!token) {
      return res.status(401).json({ status: false, message: 'Access Denied. No token provided.' });
    }

    // Verify the token
    const secretKey = 'abc'; 
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ status: false, message: 'Invalid or expired token.' });
      }

      req.user = decoded;
      next(); 
    });

  } catch (err) {
    console.error('Error verifying JWT:', err);
    res.status(500).json({ status: false, message: 'An error occurred while verifying the token.' });
  }
}

module.exports = {verify_jwt}