
// routes/school.routes.js
const router = require("express").Router();
const { completeSchoolProfile } = require("../controllers/school.controller");
const auth = require("../middleware/auth.middleware");

router.post("/complete-profile", auth, completeSchoolProfile);
module.exports = router;
