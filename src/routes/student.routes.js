const express = require("express");
const router = express.Router();
const {addStudent, updateStudent} = require("../controllers/student.controller");

// POST → Add student
router.post("/",  addStudent);
// PUT /api/students/:id
router.put("/:id", updateStudent);


module.exports = router;
