 
const bcrypt = require("bcrypt");
const prisma = require("../config/db");

 exports.addTeacher = async (req, res) => {
  try {
    const { fullName, email, phone, schoolId, subjects } = req.body;

   
    // 1️⃣ Validate
    if (!fullName || !email || !schoolId || !subjects?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2️⃣ Check if admin/user already exists
    const existingUser = await prisma.admin.findUnique({
      where: { email }
    });


    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 3️⃣ Create Admin (Teacher user)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const adminUser = await prisma.admin.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: "TEACHER",
        status: "INVITED",
        schoolId
      }
    });

    // 4️⃣ Fetch Subjects belonging to school
    const subjectRecords = await prisma.subject.findMany({
      where: {
        name: { in: subjects },
        schoolId
      }
    });

    // Check that all requested subjects exist
const dbSubjectNames = subjectRecords.map(s => s.name);

// Find any subjects that are missing
const invalidSubjects = subjects.filter(s => !dbSubjectNames.includes(s));

if (invalidSubjects.length > 0) {
  return res.status(400).json({
    message: "One or more subjects are invalid",
    invalidSubjects // optionally send which ones are invalid
  });
}

    // 5️⃣ Create Teacher and connect subjects
    const teacher = await prisma.teacher.create({
      data: {
        userId: adminUser.id,
        email,
        schoolId,
        fullName,
        phone,
        subjects: {
          connect: subjectRecords.map(s => ({ id: s.id }))
        }
      },
      include: {
        subjects: true,
        user: true
      }
    });

    // 6️⃣ Response
    return res.status(201).json({
      message: "Teacher added successfully",
      teacher,
      tempPassword // send via email in real app
    });

  } catch (error) {
    console.error(error);
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
      include: { user: true, subjects: true }
    });

    if (!existingTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 2️⃣ Validate subjects (if provided)
    let subjectRecords = [];
     console.log("hello subjects", subjects)

    if (subjects?.length) {

      subjectRecords = await prisma.subject.findMany({
        where: {
          name: { in: subjects },
          schoolId: existingTeacher.schoolId
        }
      });

      const dbSubjectNames = subjectRecords.map(s => s.name);
      const invalidSubjects = subjects.filter(
        s => !dbSubjectNames.includes(s)
      );

      if (invalidSubjects.length > 0) {
        return res.status(400).json({
          message: "One or more subjects are invalid",
          invalidSubjects
        });
      }
    }

    // 3️⃣ Update Admin (User) name
    if (fullName) {
      await prisma.admin.update({
        where: { id: existingTeacher.userId },
        data: { name: fullName }
      });
    }

    // 4️⃣ Update Teacher + reset subjects
    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(subjects && {
          subjects: {
            set: [], // 🔥 remove old
            connect: subjectRecords.map(s => ({ id: s.id }))
          }
        })
      },
      include: {
        subjects: true,
        user: true
      }
    });

    return res.status(200).json({
      message: "Teacher updated successfully",
      teacher: updatedTeacher
    });

  } catch (error) {
    console.error("Update teacher error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.getTeachersBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        message: "schoolId is required"
      });
    }

    const teachers = await prisma.teacher.findMany({
      where: {
        schoolId
      },
      include: {
        subjects: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json({
      message: "Teachers fetched successfully",
      teachers
    });

  } catch (error) {
    console.error("Get Teachers Error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
