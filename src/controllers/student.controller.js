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
      parentPhone,
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
      where: { email },
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
        parentPhone,
      },
    });

    return res.status(201).json({
      message: "Student registered successfully",
      student,
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

exports.softDeleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return res.json({
      message: "Student removed successfully",
      student,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to remove student" });
  }
};

exports.activateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });

    return res.json({
      message: "Student activated successfully",
      student,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to activate student" });
  }
};

exports.bulkAddStudents = async (req, res) => {
  try {
    const { schoolId, students } = req.body;

    if (!schoolId || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    /* -----------------------------
       1. Preload classes & sections
    -------------------------------- */
    const classes = await prisma.class.findMany({
      where: { schoolId },
      include: { sections: true },
    });

    const classMap = {};
    const sectionMap = {};

    classes.forEach((cls) => {
      classMap[cls.displayName] = cls.id; // "Class 1" → id

      cls.sections.forEach((sec) => {
        sectionMap[`${cls.id}_${sec.name}`] = sec.id; // classId_A → sectionId
      });
    });

    /* -----------------------------
       2. Prepare insert data
    -------------------------------- */
    const insertData = [];
    const skipped = [];

    for (const s of students) {
      const {
        firstName,
        lastName,
        email,
        phone,
        parentName,
        parentPhone,
        className,
        sectionName,
      } = s;

      if (!className || !email) {
        skipped.push({ email, reason: "Missing className or email" });
        continue;
      }

      const classId = classMap[className];
      if (!classId) {
        skipped.push({ email, reason: `Class not found: ${className}` });
        continue;
      }

      let sectionId = null;
      if (sectionName) {
        sectionId = sectionMap[`${classId}_${sectionName}`];
        if (!sectionId) {
          skipped.push({
            email,
            reason: `Section not found: ${sectionName}`,
          });
          continue;
        }
      }

      // duplicate check
      const exists = await prisma.student.findUnique({
        where: { email },
      });

      if (exists) {
        skipped.push({ email, reason: "Student already exists" });
        continue;
      }

      insertData.push({
        schoolId,
        classId,
        sectionId,
        firstName,
        lastName,
        email,
        phone,
        parentName,
        parentPhone,
      });
    }

    /* -----------------------------
       3. Insert in bulk
    -------------------------------- */
    const created = await prisma.student.createMany({
      data: insertData,
      skipDuplicates: true,
    });

    return res.status(201).json({
      message: "Bulk student upload completed",
      insertedCount: created.count,
      skipped,
    });
  } catch (error) {
    console.error("Bulk Add Students Error:", error);
    return res.status(500).json({ message: "Bulk upload failed" });
  }
};
