const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const authService = require("../services/auth.service");

exports.registerSchool = async (req, res) => {
  try {
    const {
      schoolName,
      board,
      city,
      state,
      schoolEmail,
      adminName,
      adminEmail,
      password,
      system,
      termsAccepted
    } = req.body;

    const school = await authService.registerSchool({
      schoolName,
      board,
      city,
      state,
      schoolEmail,
      adminName,
      adminEmail,
      password,
      system,
      termsAccepted
    });

    res.status(201).json({
      message: 'School registered successfully.',
      school
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error cases
    if (error.message === 'Terms must be accepted.' || 
        error.message === 'School email already exists.') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, schoolId: user.schoolId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
