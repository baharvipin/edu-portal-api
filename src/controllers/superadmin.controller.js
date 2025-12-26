const prisma = require("../config/db");

/**
 * SUPER ADMIN
 * Get all schools with profile + admin details
 */
exports.getAllSchoolsWithDetails = async (req, res) => {
  try {
    // Optional: ensure only SUPER_ADMIN can access
    console.log("User role:", req.user);
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const schools = await prisma.school.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        profile: true, // SchoolProfile
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(200).json({
      count: schools.length,
      data: schools,
    });
  } catch (error) {
    console.error("Get all schools error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.approveSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // 1️⃣ Find school with profile
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        profile: true,
      },
    });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // 2️⃣ Allow approve only if profile submitted
    if (school.status !== "PROFILE_SUBMITTED") {
      return res.status(400).json({
        message: `School cannot be approved in '${school.status}' status`,
      });
    }

    // 3️⃣ Ensure profile exists
    if (!school.profile) {
      return res.status(400).json({
        message: "School profile is missing",
      });
    }

    // 4️⃣ Update school status
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        status: "ACTIVE",
        profileCompleted: true,
      },
    });

    res.status(200).json({
      message: "School approved successfully",
      school: updatedSchool,
    });

  } catch (error) {
    console.error("Approve School Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
