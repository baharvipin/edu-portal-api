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
      return res.status(403).json({ status: false, message: "Unauthorized" });
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
      return res
        .status(400)
        .json({
          status: false,
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
      status: true,
      message: "School profile completed & activated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

/**
 * Dashboard overview (ALL DATA IN ONE CALL)
 */
exports.getSchoolOverview = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const [teachers, students, subjects, classes] = await Promise.all([
      prisma.teacher.findMany({
        where: { schoolId },
      }),
      prisma.student.findMany({
        where: { schoolId },
      }),
      prisma.subject.findMany({
        where: { schoolId },
      }),
      prisma.class.findMany({
        where: { schoolId },
        include: {
          sections: true,
        },
      }),
    ]);

    res.json({ status: true, message: "Fetched data for school overview",  teachers, students, subjects, classes });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: false, message: "Failed to fetch school overview" });
  }
};

/**
 * Individual APIs
 */
exports.getTeachersBySchool = async (req, res) => {
  const { schoolId } = req.params;
  const teachers = await prisma.teacher.findMany({ where: { schoolId } });
  res.json({ status: true, teachers,  message: "Fetched data for teachers" });
};

exports.getStudentsBySchool = async (req, res) => {
  const { schoolId } = req.params;
  const students = await prisma.student.findMany({ where: { schoolId } });
  res.json({ status: true, students ,  message: "Fetched data for school student"});
};

exports.getSubjectsBySchool = async (req, res) => {
  const { schoolId } = req.params;
  const subjects = await prisma.subject.findMany({ where: { schoolId } });
  res.json({ status: true, subjects,  message: "Fetched data for school subjects" });
};

exports.getClassesBySchool = async (req, res) => {
  const { schoolId } = req.params;
  const classes = await prisma.class.findMany({
    where: { schoolId },
    include: {
      sections: true,
    },
  });
  res.json({ status: true, classes,  message: "Fetched data for school classes" });
};
