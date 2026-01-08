const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  addTeacher,
  getTeachersBySchool,
  updateTeacher,
  activateTeacher,
  deActivateTeacher,
  getTeacherDashboard,
} = require("../controllers/teacher.controller");

// ✅ Specific routes FIRST
router.get("/dashboard", auth, getTeacherDashboard);
// GET teachers by schoolId
router.get("/:schoolId", auth, getTeachersBySchool);
router.post("/addTeacher", auth, addTeacher);
router.put("/:id", auth, updateTeacher);
router.put("/activate/:teacherId", auth, activateTeacher);
router.put("/deactivate/:teacherId", auth, deActivateTeacher);

module.exports = router;
