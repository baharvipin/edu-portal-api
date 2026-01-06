const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subject.controller");

// GET subjects by schoolId
router.get("/:schoolId", subjectController.getSubjectsBySchool);

module.exports = router;
