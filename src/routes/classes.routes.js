const router = require("express").Router();
const {addClass, addClassesBulk, getClassesBySchool} = require("../controllers/classes.controller");

router.post("/addclasses/:schoolId", addClass );
// Get all classes by school ID
router.get("/:schoolId", getClassesBySchool);

module.exports = router;
