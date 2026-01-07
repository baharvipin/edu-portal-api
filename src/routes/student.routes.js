const express = require("express");
const router = express.Router();
const {addStudent} = require("../controllers/student.controller");

// POST → Add student
router.post("/",  addStudent);

module.exports = router;
