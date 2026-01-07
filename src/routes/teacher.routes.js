const router = require("express").Router();
const {
  addTeacher,
  getTeachersBySchool,
  updateTeacher,
  activateTeacher,
  deActivateTeacher,
} = require("../controllers/teacher.controller");

// GET teachers by schoolId
router.get("/:schoolId", getTeachersBySchool);
router.post("/addTeacher", addTeacher);
router.put("/:id", updateTeacher);
router.put("/activate/:teacherId", activateTeacher);
router.put("/deactivate/:teacherId", deActivateTeacher);

module.exports = router;
