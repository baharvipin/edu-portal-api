
const router = require("express").Router(); 
const {addTeacher}  = require("../controllers/teacher.controller") 
router.post("/addTeacher", addTeacher);
module.exports = router;
