// controllers/school.controller.js
const prisma = require("../config/db");

exports.completeSchoolProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Get logged-in admin (changed from user to admin)
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin || !admin.schoolId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 2️⃣ Extract body
    const {
      fullAddress,
      registrationNumber,
      medium,
      yearEstablished,

      classes,
      academicYear,
      schoolTimings,
      gradingSystem,

      hasLabs,
      hasTransport,
      hasHostel,

      logoUrl,
      registrationCertUrl,
      boardAffiliationUrl,

      attendanceMode,
      notificationMode,

      examsModuleEnabled,
      homeworkModuleEnabled,
    } = req.body;

    // 3️⃣ Basic validation (important)
    if (
      !fullAddress ||
      !registrationNumber ||
      !medium ||
      !yearEstablished ||
      !classes ||
      !academicYear ||
      !schoolTimings
    ) {
      return res.status(400).json({
        message: "Missing required school profile fields",
      });
    }

    // 4️⃣ Upsert School Profile
    await prisma.schoolProfile.upsert({
      where: { schoolId: admin.schoolId },
      update: {
        fullAddress,
        registrationNumber,
        medium,
        yearEstablished,

        classes,
        academicYear,
        schoolTimings,
        gradingSystem,

        hasLabs,
        hasTransport,
        hasHostel,

        logoUrl,
        registrationCertUrl,
        boardAffiliationUrl,

        attendanceMode,
        notificationMode,

        examsModuleEnabled,
        homeworkModuleEnabled,
      },
      create: {
        schoolId: admin.schoolId,

        fullAddress,
        registrationNumber,
        medium,
        yearEstablished,

        classes,
        academicYear,
        schoolTimings,
        gradingSystem,

        hasLabs,
        hasTransport,
        hasHostel,

        logoUrl,
        registrationCertUrl,
        boardAffiliationUrl,

        attendanceMode,
        notificationMode,

        examsModuleEnabled,
        homeworkModuleEnabled,
      },
    });

    // 5️⃣ Activate school after completion
    await prisma.school.update({
      where: { id: admin.schoolId },
      data: { status: "PROFILE_SUBMITTED" },
    });

    res.status(200).json({
      message: "School profile completed & activated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
