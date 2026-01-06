const express = require("express");
const router = express.Router();
const {getSubjectsBySchool, createSubject} = require("../controllers/subject.controller");

// GET subjects by schoolId
router.get("/:schoolId", getSubjectsBySchool);

// POST /subjects -> create new subject
router.post("/addSubject", createSubject);

module.exports = router;
