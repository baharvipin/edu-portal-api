const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  addTeacher,
  getTeachersBySchool,
  updateTeacher,
  activateTeacher,
  deActivateTeacher,
  getTeacherDashboard,
  getSchoolTeacherAssignments,
  assignTeacher,
  updateTeacherAssignment,
  deleteTeacherAssignment,
} = require("../controllers/teacher.controller");

// ✅ Specific routes FIRST
router.get("/dashboard/:teacherId", auth, getTeacherDashboard);
// GET teachers by schoolId
router.get("/:schoolId", auth, getTeachersBySchool);
router.post("/addTeacher", auth, addTeacher);
router.put("/:id", auth, updateTeacher);
router.put("/activate/:teacherId", auth, activateTeacher);
router.put("/deactivate/:teacherId", auth, deActivateTeacher);

router.get("/:schoolId/teacher-assignments", auth, getSchoolTeacherAssignments);

router.post("/:teacherId/assignments", auth, assignTeacher);

// --------------------------
// Update an existing assignment
// --------------------------
router.put("/assignments/:assignmentId", auth, updateTeacherAssignment);

router.delete(
  "/assignments/delete/:assignmentId",
  auth,
  deleteTeacherAssignment,
);

module.exports = router;
