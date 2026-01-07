const prisma = require("../config/db");

// POST /api/sections
exports.addSection = async (req, res) => {
  try {
    const { schoolId, classId, name } = req.body;

    // 1️⃣ Validation
    if (!schoolId || !classId || !name) {
      return res.status(400).json({
        message: "schoolId, classId and section name are required",
      });
    }

    if (!/^[A-Z]$/.test(name)) {
      return res.status(400).json({
        message: "Section name must be a single capital letter (A, B, C)",
      });
    }

    // 2️⃣ Check class exists & belongs to school
    const cls = await prisma.class.findFirst({
      where: {
        id: classId,
        schoolId,
      },
    });

    if (!cls) {
      return res.status(404).json({
        message: "Class not found for this school",
      });
    }

    // 3️⃣ Create section
    const section = await prisma.section.create({
      data: {
        schoolId,
        classId,
        name,
      },
    });

    return res.status(201).json({
      message: "Section added successfully",
      section,
    });

  } catch (error) {
    console.error(error);

    // 4️⃣ Unique constraint (classId + name)
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Section already exists for this class",
      });
    }

    return res.status(500).json({
      message: "Failed to add section",
    });
  }
};
