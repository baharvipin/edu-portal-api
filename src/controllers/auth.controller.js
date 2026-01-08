const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const authService = require("../services/auth.service");
const FORCE_PASSWORD_CHANGE_ROLES = ["TEACHER", "STUDENT"];

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

    const user = await prisma.admin.findUnique({
      where: { email },
    });

    console.log("Login attempt for user:", email, user );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
let teacher = null;
  let student = null;
    // 🔐 Enforce password change ONLY for Teacher & Student
    if (FORCE_PASSWORD_CHANGE_ROLES.includes(user.role)) {
      let mustChangePassword = false;

      
      if (user.role === "TEACHER") {
         teacher = await prisma.teacher.findUnique({
          where: { userId: user.id }
        });

        mustChangePassword = teacher?.mustChangePassword ?? false;
        console.log("Teacher mustChangePassword:", teacher);
      }

    
      if (user.role === "STUDENT") {
          student = await prisma.student.findUnique({
          where: { userId: user.id },
          select: { mustChangePassword: true },
        });

        mustChangePassword = student?.mustChangePassword ?? false;
      }

      if (mustChangePassword) {
        return res.status(200).json({
          mustChangePassword: true,
          userId: user.id,
          role: user.role,
          message: "Please change your temporary password",
        });
      }
    }

    // 🏫 Validate school
    let school = null;
    if (user.schoolId) {
      school = await prisma.school.findUnique({
        where: { id: user.schoolId },
      });

      if (!school || !school.isActive) {
        return res.status(403).json({ message: "School is not active" });
      }
    }

    // 🔑 JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        schoolId: user.schoolId,
        teacherId: teacher?.id || null,
        studentId: student?.id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        userRole: user.role,
        schoolId: user.schoolId,
        teacherId: teacher?.id || null,
        studentId: student?.id || null,
      },
      school,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { newPassword, userId: adminId, role } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // 🔒 Only Teacher & Student allowed
    // if (!["TEACHER", "STUDENT"].includes(role)) {
    //   return res.status(403).json({
    //     message: "Password change not allowed for this role",
    //   });
    // }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
      // 🔑 Update admin login password
      await tx.admin.update({
        where: { id: adminId },
        data: {
          password: hashedPassword,
          status: "ACTIVE",
        },
      });

      // 🔄 Reset mustChangePassword flag
      if (role === "TEACHER") {
        await tx.teacher.update({
          where: { userId: adminId },
          data: { mustChangePassword: false },
        });
      }

      if (role === "STUDENT") {
        await tx.student.update({
          where: { userId: adminId },
          data: { mustChangePassword: false },
        });
      }
    });

    res.json({
      message: "Password updated successfully",
      forceLogout: true,
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      message: "Failed to update password",
    });
  }
};
