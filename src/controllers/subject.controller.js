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
        name: true
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
