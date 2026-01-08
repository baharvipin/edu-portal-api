const router = require("express").Router();
const {
  registerSchool,
  login,
  changePassword,
} = require("../controllers/auth.controller");

router.post("/register", registerSchool);
router.post("/login", login);
router.post("/change-password", changePassword);

module.exports = router;
