const router = require("express").Router();
const {
  getAllSchoolsWithDetails,
  approveSchool,
    suspendSchool,
} = require("../controllers/superadmin.controller");

const auth = require("../middleware/auth.middleware");
const requireSuperAdmin = require("../middleware/requireSuperAdmin");

// Protected routes
router.get("/schools", auth, getAllSchoolsWithDetails);
router.patch(
  "/schools/:schoolId/approve",
  auth,
  requireSuperAdmin,
  approveSchool
);

router.patch(
  "/schools/:schoolId/suspend",
  auth,
  requireSuperAdmin,
  suspendSchool
);

module.exports = router;
