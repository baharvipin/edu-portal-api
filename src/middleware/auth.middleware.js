const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
      include: { school: true }
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid or inactive user" });
    }

    // Attach admin and school info to request
    req.user = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      schoolId: admin.schoolId,
      school: admin.school,
      role: admin.role,
      isActive: admin.isActive
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

module.exports = auth;
