const router = require("express").Router();
const {addClass, addClassesBulk} = require("../controllers/classes.controller");

router.post("/addclasses/:schoolId", addClass );
module.exports = router;
