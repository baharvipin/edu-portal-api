
const router = require("express").Router(); 
const {addTeacher, getTeachersBySchool}  = require("../controllers/teacher.controller")

  

// GET teachers by schoolId
router.get("/:schoolId", getTeachersBySchool); 
router.post("/addTeacher", addTeacher);
module.exports = router;
