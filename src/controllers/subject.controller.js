const prisma = require("../config/db");

exports.getSubjectsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        message: "schoolId is required",
      });
    }

    const subjects = await prisma.subject.findMany({
      where: {
        schoolId,
        isActive: true,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json({
      message: "Subjects fetched successfully",
      subjects,
    });
  } catch (error) {
    console.error("Get Subjects Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * Create a new Subject
 */
exports.createSubject = async (req, res) => {
  try {
    const { code, name, schoolId, sectionId, classId } = req.body;

    // Validation
    if (!name || !schoolId) {
      return res.status(400).json({ error: "Name and schoolId are required" });
    }

    // Create subject
    const newSubject = await prisma.subject.create({
      data: { code, name, schoolId, sectionId, classId, isActive: true },
    });

    return res.status(201).json(newSubject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update Subject
 */
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    // Validation
    if (!id) {
      return res.status(400).json({ error: "Subject id is required" });
    }

    if (!name && !code) {
      return res.status(400).json({
        error: "At least one field (name or code) is required to update",
      });
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Update subject
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
      },
    });

    return res.status(200).json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete Subject
 */
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    // Validation
    if (!id) {
      return res.status(400).json({ error: "Subject id is required" });
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Soft delete subject
    await prisma.subject.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.assignSubjectsToStudent = async (req, res) => {
  try {
    const { studentId, subjectIds } = req.body;

    if (!studentId || !Array.isArray(subjectIds)) {
      return res.status(400).json({
        message: "studentId and subjectIds are required",
      });
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch existing subject assignments
      const existing = await tx.studentSubject.findMany({
        where: { studentId },
        select: {
          id: true,
          subjectId: true,
          isActive: true,
        },
      });

      const existingSubjectIds = existing.map((e) => e.subjectId);

      // 2️⃣ Identify subjects to CREATE
      const toCreate = subjectIds.filter(
        (id) => !existingSubjectIds.includes(id),
      );

      // 3️⃣ Identify subjects to DEACTIVATE
      const toDeactivate = existing
        .filter((e) => !subjectIds.includes(e.subjectId) && e.isActive)
        .map((e) => e.subjectId);

      // 4️⃣ Identify subjects to REACTIVATE
      const toReactivate = existing
        .filter((e) => subjectIds.includes(e.subjectId) && !e.isActive)
        .map((e) => e.subjectId);

      // 🔹 CREATE new assignments
      if (toCreate.length > 0) {
        await tx.studentSubject.createMany({
          data: toCreate.map((subjectId) => ({
            studentId,
            subjectId,
            isActive: true,
          })),
        });
      }

      // 🔹 DEACTIVATE removed subjects
      if (toDeactivate.length > 0) {
        await tx.studentSubject.updateMany({
          where: {
            studentId,
            subjectId: { in: toDeactivate },
          },
          data: { isActive: false },
        });
      }

      // 🔹 REACTIVATE existing but inactive subjects
      if (toReactivate.length > 0) {
        await tx.studentSubject.updateMany({
          where: {
            studentId,
            subjectId: { in: toReactivate },
          },
          data: { isActive: true },
        });
      }
    });

    return res.status(200).json({
      message: "Student subjects updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to assign subjects",
      error: error.message,
    });
  }
};
