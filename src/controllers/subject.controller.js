const prisma = require("../config/db");

exports.getSubjectsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        message: "schoolId is required"
      });
    }

    const subjects = await prisma.subject.findMany({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        schoolId: true,
        code: true
      },
      orderBy: {
        name: "asc"
      }
    });

    return res.status(200).json({
      message: "Subjects fetched successfully",
      subjects
    });

  } catch (error) {
    console.error("Get Subjects Error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
 
/**
 * Create a new Subject
 */
exports.createSubject = async (req, res) => {
  try {
    const { code, name, schoolId } = req.body;

    // Validation
    if (!name || !schoolId) {
      return res.status(400).json({ error: "Name and schoolId are required" });
    }

    // Create subject
    const newSubject = await prisma.subject.create({
      data: { code, name, schoolId },
    });

    return res.status(201).json(newSubject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

