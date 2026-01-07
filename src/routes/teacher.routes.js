
const router = require("express").Router(); 
const {addTeacher, getTeachersBySchool, updateTeacher}  = require("../controllers/teacher.controller")

  

// GET teachers by schoolId
router.get("/:schoolId", getTeachersBySchool); 
router.post("/addTeacher", addTeacher);
router.put("/:id", updateTeacher);
module.exports = router;
