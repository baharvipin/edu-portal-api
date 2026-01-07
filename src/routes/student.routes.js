const express = require("express");
const router = express.Router();
const {
  addStudent,
  updateStudent,
  softDeleteStudent,
  activateStudent,
} = require("../controllers/student.controller");

// POST → Add student
router.post("/", addStudent);
// PUT /api/students/:id
router.put("/:id", updateStudent);
router.put("/:id/delete", softDeleteStudent);
router.put("/:id/activate", activateStudent);

module.exports = router;
