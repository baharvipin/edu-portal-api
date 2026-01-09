const express = require("express");
const router = express.Router();
const {
  getSubjectsBySchool,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/subject.controller");

// GET subjects by schoolId
router.get("/:schoolId", getSubjectsBySchool);

// POST /subjects -> create new subject
router.post("/addSubject", createSubject);
// routes/subject.routes.js
router.put("/:id", updateSubject);
router.patch("/:id", deleteSubject);

module.exports = router;
