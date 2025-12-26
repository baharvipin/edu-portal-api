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
