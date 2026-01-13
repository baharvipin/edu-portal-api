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
      return res.status(403).json({ status: false, message: "Access denied" });
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

    res
      .status(200)
      .json({ status: true, count: schools.length, data: schools });
  } catch (error) {
    console.error("Get all schools error:", error);
    res.status(500).json({ status: false, message: "Server error" });
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
      return res
        .status(404)
        .json({ status: false, message: "School not found" });
    }

    // 2️⃣ Allow approve only if profile submitted
    // if (school.status !== "PROFILE_SUBMITTED") {
    //   return res.status(400).json({
    //     message: `School cannot be approved in '${school.status}' status`,
    //   });
    // }

    // 3️⃣ Ensure profile exists
    if (!school.profile) {
      return res
        .status(400)
        .json({ status: false, message: "School profile is missing" });
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
      status: true,
      message: "School approved successfully",
      school: updatedSchool,
    });
  } catch (error) {
    console.error("Approve School Error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.suspendSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { reason } = req.body; // optional

    // 1️⃣ Find school
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return res
        .status(404)
        .json({ status: false, message: "School not found" });
    }

    // 2️⃣ Only ACTIVE schools can be suspended
    if (school.status !== "ACTIVE") {
      return res.status(400).json({
        status: false,
        message: `Only ACTIVE schools can be suspended. Current status: ${school.status}`,
      });
    }

    // 3️⃣ Update status to SUSPENDED
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        status: "SUSPENDED",
      },
    });

    res.status(200).json({
      status: true,
      message: "School suspended successfully",
      school: updatedSchool,
    });
  } catch (error) {
    console.error("Suspend School Error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.deactivateSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // 1️⃣ Find school
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return res
        .status(404)
        .json({ status: false, message: "School not found" });
    }

    // 2️⃣ Only ACTIVE schools can be deactivated
    if (school.status !== "ACTIVE") {
      return res.status(400).json({
        status: false,
        message: `Only ACTIVE schools can be deactivated. Current status: ${school.status}`,
      });
    }

    // 3️⃣ Update status to INACTIVE
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        status: "INACTIVE",
      },
    });

    res.status(200).json({
      status: true,
      message: "School deactivated successfully",
      school: updatedSchool,
    });
  } catch (error) {
    console.error("Deactivate School Error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.rejectSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // 1️⃣ Find school
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return res
        .status(404)
        .json({ status: false, message: "School not found" });
    }

    // 2️⃣ Allow reject only for specific states
    const allowedStatuses = ["PROFILE_SUBMITTED", "PROFILE_INCOMPLETE"];

    if (!allowedStatuses.includes(school.status)) {
      return res.status(400).json({
        status: false,
        message: `School cannot be rejected in '${school.status}' status`,
      });
    }

    // 3️⃣ Update school status
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        status: "REJECTED",
        profileCompleted: false,
        // Optional future use
        // rejectionReason: reason ?? null,
      },
    });

    res.status(200).json({
      status: true,
      message: "School rejected successfully",
      school: updatedSchool,
    });
  } catch (error) {
    console.error("Reject School Error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
