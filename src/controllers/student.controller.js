const prisma = require("../config/db");

/**
 * POST /api/students
 * Add new student
 */
exports.addStudent = async (req, res) => {
  try {
    const {
      schoolId,
      classId,
      sectionId,
      firstName,
      lastName,
      email,
      phone,
      parentName,
      parentPhone
    } = req.body;

    // Basic validation
    if (
      !schoolId ||
      !classId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !parentName ||
      !parentPhone
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check duplicate email
    const existingStudent = await prisma.student.findUnique({
      where: { email }
    });

    if (existingStudent) {
      return res.status(409).json({ message: "Student already exists" });
    }

    const student = await prisma.student.create({
      data: {
        schoolId,
        classId,
        sectionId: sectionId || null,
        firstName,
        lastName,
        email,
        phone,
        parentName,
        parentPhone
      }
    });

    return res.status(201).json({
      message: "Student registered successfully",
      student
    });

  } catch (error) {
    console.error("Add Student Error:", error);
    return res.status(500).json({ message: "Failed to add student" });
  }
};


exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      lastName,
      email,
      phone,
      classId,
      sectionId,
      parentName,
      parentPhone,
    } = req.body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        classId,
        sectionId,
        parentName,
        parentPhone,
      },
    });

    res.json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update student" });
  }
};

