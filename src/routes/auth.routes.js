const router = require("express").Router();
const { registerSchool, login } = require("../controllers/auth.controller");

router.post("/register", registerSchool);
router.post("/login", login);

module.exports = router;
