const router = require("express").Router();
const {
  getAllSchoolsWithDetails
} = require("../controllers/superadmin.controller");

const auth = require("../middleware/auth.middleware");

// Protected routes
router.get("/schools", auth, getAllSchoolsWithDetails);

module.exports = router;
