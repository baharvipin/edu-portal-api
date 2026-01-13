const express = require("express");
const router = express.Router();
const {
  addStudent,
  updateStudent,
  softDeleteStudent,
  activateStudent,
  bulkAddStudents,
  assignSubjectsToStudent,
  getStudentById,
} = require("../controllers/student.controller");

// POST → Add student
router.post("/", addStudent);
// PUT /api/students/:id
router.put("/:id", updateStudent);
router.put("/:id/delete", softDeleteStudent);
router.put("/:id/activate", activateStudent);

router.post("/bulk-upload", bulkAddStudents);

router.post("/:studentId/subjects", assignSubjectsToStudent);
router.get("/dashboard/:studentId", getStudentById);

module.exports = router;
