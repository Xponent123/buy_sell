const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  
  const token = req.cookies.token;

  
  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'No token found. Please log in.',
      redirectTo: '/login' 
    });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    req.user = decoded;
    
    
    next();
  } catch (error) {
    
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or expired token',
      redirectTo: '/login' 
    });
  }
};

module.exports = requireAuth;