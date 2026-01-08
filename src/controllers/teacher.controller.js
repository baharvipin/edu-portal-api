const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const sendMail = require("../utils/sendEmail");
const teacherTempPasswordTemplate = require("../templates/teacherTempPassword");
// exports.addTeacher = async (req, res) => {
//   try {
//     const { fullName, email, phone, schoolId, subjects } = req.body;

//     // 1️⃣ Validate
//     if (!fullName || !email || !schoolId || !subjects?.length) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // 2️⃣ Check existing admin
//     const existingUser = await prisma.admin.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       return res.status(409).json({ message: "User already exists" });
//     }

//     // 3️⃣ Validate subjects FIRST
//     const subjectRecords = await prisma.subject.findMany({
//       where: {
//         name: { in: subjects },
//         schoolId,
//       },
//     });

//     const dbSubjectNames = subjectRecords.map((s) => s.name);
//     const invalidSubjects = subjects.filter(
//       (s) => !dbSubjectNames.includes(s)
//     );

//     if (invalidSubjects.length > 0) {
//       return res.status(400).json({
//         message: "Invalid subjects found",
//         invalidSubjects,
//       });
//     }

//     // 4️⃣ Generate temp password
//     const tempPassword = Math.random().toString(36).slice(-8);
//     const hashedPassword = await bcrypt.hash(tempPassword, 10);
//     console.log("tempPassword", req.body, tempPassword );

//     await sendMail({
//      to: email,
//      subject: "You're invited as a Teacher on EduPortal",
//      html: teacherTempPasswordTemplate({fullName, email, tempPassword}),
//    });

//     // 5️⃣ TRANSACTION (Admin + Teacher)
//     // const result = await prisma.$transaction(async (tx) => {
//     //   const adminUser = await tx.admin.create({
//     //     data: {
//     //       name: fullName,
//     //       email,
//     //       password: hashedPassword,
//     //       role: "TEACHER",
//     //       status: "INVITED",
//     //       schoolId,
//     //     },
//     //   });

//     //   const teacher = await tx.teacher.create({
//     //     data: {
//     //       userId: adminUser.id,
//     //       email,
//     //       fullName,
//     //       phone,
//     //       schoolId,
//     //       isActive: false,
//     //       subjects: {
//     //         connect: subjectRecords.map((s) => ({ id: s.id })),
//     //       },
//     //     },
//     //     include: {
//     //       subjects: true,
//     //     },
//     //   });

//     //   return { adminUser, teacher };
//     // });

//      // 5️⃣ TRANSACTION (Admin + Teacher)
//     const result = await prisma.$transaction(async (tx) => {
//       const adminUser = await tx.admin.create({
//         data: {
//           name: fullName,
//           email,
//           password: hashedPassword,
//           role: "TEACHER",
//           status: "INVITED",
//           schoolId,
//         },
//       });

//       const teacher = await tx.teacher.create({
//         data: {
//           userId: adminUser.id,
//           email,
//           fullName,
//           phone,
//           schoolId,
//           isActive: false,
//           subjects: {
//             connect: subjectRecords.map((s) => ({ id: s.id })),
//           },
//         },
//         include: {
//           subjects: true,
//         },
//       });

//       return { adminUser, teacher };
//     });

//     // 6️⃣ Send email (VERY IMPORTANT)
//     await sendMail({
//       to: email,
//       subject: "You're invited as a Teacher on EduPortal",
//       html: teacherTempPasswordTemplate(fullName, email, tempPassword, process.env.FRONTEND_LOGIN_URL),
//     });

//     return res.status(201).json({
//       message: "Teacher added successfully and invitation email sent",
//       teacher: result.teacher,
//     });
//   } catch (error) {
//     console.error("Add teacher error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// exports.addTeacher = async (req, res) => {
//   try {
//     const { fullName, email, phone, schoolId, subjects } = req.body;

//     // 1️⃣ Validate
//     if (!fullName || !email || !schoolId || !subjects?.length) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // 2️⃣ Check if admin/user already exists
//     const existingUser = await prisma.admin.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       return res.status(409).json({ message: "User already exists" });
//     }

//     // 3️⃣ Create Admin (Teacher user)
//     const tempPassword = Math.random().toString(36).slice(-8);
//     const hashedPassword = await bcrypt.hash(tempPassword, 10);

//     const adminUser = await prisma.admin.create({
//       data: {
//         name: fullName,
//         email,
//         password: hashedPassword,
//         role: "TEACHER",
//         status: "INVITED",
//         schoolId,
//       },
//     });

//     // 4️⃣ Fetch Subjects belonging to school
//     const subjectRecords = await prisma.subject.findMany({
//       where: {
//         name: { in: subjects },
//         schoolId,
//       },
//     });

//     // Check that all requested subjects exist
//     const dbSubjectNames = subjectRecords.map((s) => s.name);

//     // Find any subjects that are missing
//     const invalidSubjects = subjects.filter((s) => !dbSubjectNames.includes(s));

//     if (invalidSubjects.length > 0) {
//       return res.status(400).json({
//         message: "One or more subjects are invalid",
//         invalidSubjects, // optionally send which ones are invalid
//       });
//     }

//     // 5️⃣ Create Teacher and connect subjects
//     const teacher = await prisma.teacher.create({
//       data: {
//         userId: adminUser.id,
//         email,
//         schoolId,
//         fullName,
//         phone,
//         subjects: {
//           connect: subjectRecords.map((s) => ({ id: s.id })),
//         },
//         mustChangePassword: true, // force password change on first login
//       },
//       include: {
//         subjects: true,
//         user: true,
//       },
//     });

//     // 6️⃣ Response
//     return res.status(201).json({
//       message: "Teacher added successfully",
//       teacher,
//       tempPassword, // send via email in real app
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.addTeacher = async (req, res) => {
  try {
    const { fullName, email, phone, schoolId, subjects } = req.body;

    // 1️⃣ Validate
    if (!fullName || !email || !schoolId || !subjects?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2️⃣ Check existing admin
    const existingUser = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 3️⃣ Validate subjects
    const subjectRecords = await prisma.subject.findMany({
      where: {
        name: { in: subjects },
        schoolId,
      },
    });

    const dbSubjectNames = subjectRecords.map((s) => s.name);
    const invalidSubjects = subjects.filter((s) => !dbSubjectNames.includes(s));

    if (invalidSubjects.length > 0) {
      return res.status(400).json({
        message: "Invalid subjects found",
        invalidSubjects,
      });
    }

    // 4️⃣ Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    console.log("Temp password for teacher:", tempPassword);

    // 5️⃣ TRANSACTION (Admin + Teacher + TeacherSubject)
    const result = await prisma.$transaction(async (tx) => {
      // Create Admin user
      const adminUser = await tx.admin.create({
        data: {
          name: fullName,
          email,
          password: hashedPassword,
          role: "TEACHER",
          status: "INVITED",
          schoolId,
        },
      });

      // Create Teacher

      const teacher = await tx.teacher.create({
        data: {
          userId: adminUser.id,
          email,
          fullName,
          phone,
          schoolId,
          isActive: false,
        },
      });

      // Create TeacherSubject entries
      await Promise.all(
        subjectRecords.map((subject) =>
          tx.teacherSubject.create({
            data: {
              teacherId: teacher.id,
              subjectId: subject.id,
              schoolId
            },
          }),
        ),
      );

      // Fetch teacher with subjects to return
      const teacherWithSubjects = await tx.teacher.findUnique({
        where: { id: teacher.id },
        include: { subjects: true },
      });

      return { adminUser, teacher: teacherWithSubjects };
    });

    // 6️⃣ Send invitation email
    await sendMail({
      to: email,
      subject: "You're invited as a Teacher on EduPortal",
      html: teacherTempPasswordTemplate({
        fullName,
        email,
        tempPassword,
        loginUrl: process.env.FRONTEND_LOGIN_URL,
      }),
    });

    return res.status(201).json({
      message: "Teacher added successfully and invitation email sent",
      teacher: result.teacher,
    });
  } catch (error) {
    console.error("Add teacher error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, subjects } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Teacher id is required" });
    }

    // 1️⃣ Check teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true, subjects: { include: { subject: true } } },
    });

    if (!existingTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 2️⃣ Validate subjects (if provided)
    let subjectRecords = [];
    if (subjects?.length) {
      subjectRecords = await prisma.subject.findMany({
        where: {
          name: { in: subjects },
          schoolId: existingTeacher.schoolId,
        },
      });

      const dbSubjectNames = subjectRecords.map((s) => s.name);
      const invalidSubjects = subjects.filter((s) => !dbSubjectNames.includes(s));

      if (invalidSubjects.length > 0) {
        return res.status(400).json({
          message: "One or more subjects are invalid",
          invalidSubjects,
        });
      }

      // 3️⃣ Compute diff
      const currentSubjectIds = existingTeacher.subjects.map((ts) => ts.subjectId);
      const newSubjectIds = subjectRecords.map((s) => s.id);

      const subjectsToAdd = newSubjectIds.filter((id) => !currentSubjectIds.includes(id));
      const subjectsToRemove = currentSubjectIds.filter((id) => !newSubjectIds.includes(id));

      // 4️⃣ Update TeacherSubjects
      await prisma.$transaction([
        // Connect new subjects
        ...subjectsToAdd.map((subjectId) =>
          prisma.teacherSubject.create({
            data: { teacherId: id, subjectId, schoolId: existingTeacher.schoolId },
          })
        ),
        // Disconnect removed subjects
        ...subjectsToRemove.map((subjectId) =>
          prisma.teacherSubject.delete({
            where: { teacherId_subjectId: { teacherId: id, subjectId } },
          })
        ),
      ]);
    }

    // 5️⃣ Update Admin name if provided
    if (fullName) {
      await prisma.admin.update({
        where: { id: existingTeacher.userId },
        data: { name: fullName },
      });
    }

    // 6️⃣ Update phone and fullName in Teacher table
    const updatedTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        subjects: { include: { subject: true } },
        user: true,
      },
    });

    return res.status(200).json({
      message: "Teacher updated successfully",
      teacher: updatedTeacher,
    });
  } catch (error) {
    console.error("Update teacher error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// exports.updateTeacher = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { fullName, phone, subjects } = req.body;

//     if (!id) {
//       return res.status(400).json({ message: "Teacher id is required" });
//     }

//     // 1️⃣ Check teacher exists
//     const existingTeacher = await prisma.teacher.findUnique({
//       where: { id },
//       include: { user: true, subjects: true },
//     });

//     if (!existingTeacher) {
//       return res.status(404).json({ message: "Teacher not found" });
//     }

//     // 2️⃣ Validate subjects (if provided)
//     let subjectRecords = [];
//     console.log("hello subjects", subjects);

//     if (subjects?.length) {
//       subjectRecords = await prisma.subject.findMany({
//         where: {
//           name: { in: subjects },
//           schoolId: existingTeacher.schoolId,
//         },
//       });

//       const dbSubjectNames = subjectRecords.map((s) => s.name);
//       const invalidSubjects = subjects.filter(
//         (s) => !dbSubjectNames.includes(s),
//       );

//       if (invalidSubjects.length > 0) {
//         return res.status(400).json({
//           message: "One or more subjects are invalid",
//           invalidSubjects,
//         });
//       }
//     }

//     // 3️⃣ Update Admin (User) name
//     if (fullName) {
//       await prisma.admin.update({
//         where: { id: existingTeacher.userId },
//         data: { name: fullName },
//       });
//     }

//     // 4️⃣ Update Teacher + reset subjects
//     const updatedTeacher = await prisma.teacher.update({
//       where: { id },
//       data: {
//         ...(fullName && { fullName }),
//         ...(phone && { phone }),
//         ...(subjects && {
//           subjects: {
//             set: [], // 🔥 remove old
//             connect: subjectRecords.map((s) => ({ id: s.id })),
//           },
//         }),
//       },
//       include: {
//         subjects: true,
//         user: true,
//       },
//     });

//     return res.status(200).json({
//       message: "Teacher updated successfully",
//       teacher: updatedTeacher,
//     });
//   } catch (error) {
//     console.error("Update teacher error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.getTeachersBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        message: "schoolId is required",
      });
    }

    const teachers = await prisma.teacher.findMany({
      where: { schoolId },
      include: {
        subjects: {
          // this is TeacherSubject
          include: {
            subject: {
              // include the actual Subject
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Teachers fetched successfully",
      teachers,
    });
  } catch (error) {
    console.error("Get Teachers Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.activateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        isActive: true,
      },
    });

    return res.json({
      message: "Teacher activated successfully",
      teacher,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to activate teacher" });
  }
};

exports.deActivateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        isActive: false,
      },
    });

    return res.json({
      message: "Teacher deactivated successfully",
      teacher,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to deactivate teacher" });
  }
};

exports.getTeacherDashboard = async (req, res) => {
  try {
    //const teacherId = req?.user?.id; // from JWT 
    const { teacherId } = req.params;
    console.log("Fetching dashboard for teacherId:",teacherId);
    // 1️⃣ Teacher Info
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        fullName: true,
        email: true,
        mustChangePassword: true,
      },
    });

    // // 2️⃣ Assigned Subjects & Classes
     const teacherSubjects = await prisma.teacherSubject.findMany({
       where: { teacherId }
     });

     const subjects = await prisma.subject.findMany();
    
      teacherSubjects.forEach(ts => {
        const subject = subjects.find(s => s.id == ts.subjectId);
        if (subject) {
          ts.subject = subject;
        }
      });
       console.log("Subjects found:", subjects, teacherSubjects);

    // // 3️⃣ Today Schedule
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);

    // const todaySchedule = await prisma.schedule.findMany({
    //   where: {
    //     teacherId,
    //     date: today
    //   }
    // });

    // // 4️⃣ Summary counts
     const subjectsCount = new Set(
       teacherSubjects.map(t => t.subjectId)
     ).size;

      // const classesCount = new Set(
      //   teacherSubjects.map(t => t.classId)
      // ).size;

    // Dummy logic (replace later)
    const studentsCount = 120;

    // 5️⃣ Pending actions (mock logic)
    const pendingActions = {
      attendancePending: 2,
      assignmentsToReview: 5,
    };

    console.log("Dashboard data prepared", teacherSubjects);

    res.json({
      teacher,
      summary: {
         subjectsCount,
        // classesCount,
        studentsCount,
        // todaysClassesCount: todaySchedule.length
      },
      //todaySchedule,
       myClasses: teacherSubjects.map(t => ({
         classId: t?.classId,
         className: t?.class?.name,
         section: t?.class?.section,
         subject: t?.subject,
       })),
      pendingActions,
      recentActivities: [
        "Attendance marked for Class 8A",
        "Assignment uploaded for Class 9B",
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};
