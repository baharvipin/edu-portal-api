// routes/school.routes.js
const router = require("express").Router();
const { completeSchoolProfile , getTeachersBySchool, getStudentsBySchool, 
    getSchoolOverview, getSubjectsBySchool, getClassesBySchool } = require("../controllers/school.controller");
const auth = require("../middleware/auth.middleware");

router.post("/complete-profile", auth, completeSchoolProfile);

// Dashboard (single call)
router.get("/:schoolId/overview",  getSchoolOverview);

// Individual APIs
router.get("/:schoolId/teachers", getTeachersBySchool);
router.get("/:schoolId/students",  getStudentsBySchool);
router.get("/:schoolId/subjects",  getSubjectsBySchool);
router.get("/:schoolId/classes", getClassesBySchool);

module.exports = router;
