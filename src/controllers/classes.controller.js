const prisma = require("../config/db");

// POST /api/classes
exports.addClass = async (req, res) => {
  try {
    let { schoolId, name, displayName, order } = req.body;

    if (typeof order == "string") {
      order = parseInt(order);
    }
    if (!schoolId || !name) {
      return res
        .status(400)
        .json({ message: "schoolId and name are required" });
    }

    const newClass = await prisma.class.create({
      data: {
        schoolId,
        name,
        displayName: displayName ?? `Class ${name}`,
        order,
      },
    });

    return res.status(201).json({
      message: "Class added successfully",
      class: newClass,
    });
  } catch (error) {
    console.error(error);

    // handle duplicate class per school
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Class already exists for this school",
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/classes/bulk
exports.addClassesBulk = async (req, res) => {
  try {
    const { schoolId, classes } = req.body;

    if (!schoolId || !classes?.length) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const data = classes.map((c, index) => ({
      schoolId,
      name: c.name,
      displayName: c.displayName ?? `Class ${c.name}`,
      order: c.order ?? index + 1,
    }));

    await prisma.class.createMany({
      data,
      skipDuplicates: true, // respects @@unique([schoolId, name])
    });

    return res.json({ message: "Classes added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add classes" });
  }
};

// GET /api/classes/:schoolId
exports.getClassesBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({ message: "School ID is required" });
    }

    // Fetch classes for the school including students
    const classes = await prisma.class.findMany({
      where: { schoolId },
      orderBy: { order: "asc" },
      include: {
        students: true, // Include students assigned to this class
        sections: true, // Include section assigned to this class
      },
    });

    return res.json({ classes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch classes" });
  }
};

// await prisma.school.update({
//   where: { id: schoolId },
//   data: {
//     classes: {
//       create: {
//         name: "10",
//         displayName: "Class 10"
//       }
//     }
//   }
// });
