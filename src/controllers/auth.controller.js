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
      termsAccepted,
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
      termsAccepted,
    });

    res.status(201).json({
      message: "School registered successfully.",
      school,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific error cases
    if (
      error.message === "Terms must be accepted." ||
      error.message === "School email already exists."
    ) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Internal server error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", password, email);

    const user = await prisma.admin.findUnique({ where: { email } });
    console.log("User fetched for login:", user);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log("Password validation result:", valid);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, schoolId: user.schoolId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    let school;
    if (user.schoolId) {
      school = await prisma.school.findUnique({ where: { id: user.schoolId } });
      if (!school || !school.isActive) {
        return res.status(403).json({ message: "School is not active" });
      }
    }

    const responsePayload = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        schoolId: user.schoolId,
        isActive: user.isActive,
        userRole: user.role,
      },
      school: user.schoolId
        ? {
            id: school.id,
            name: school.name,
            isActive: school.isActive,
            status: school.status,
            profileCompleted: school.profileCompleted,
            system: school.system,
            board: school.board,
            city: school.city,
            state: school.state,
            email: school.email,
            createdAt: school.createdAt,
            updatedAt: school.updatedAt,
          }
        : null,
    };
    console.log("Login successful for data:", responsePayload);

    res.json(responsePayload);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
