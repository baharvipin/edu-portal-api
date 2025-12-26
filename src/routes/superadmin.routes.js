const router = require("express").Router();
const {
  getAllSchoolsWithDetails,
  approveSchool,
  suspendSchool,
  deactivateSchool,
  rejectSchool,
} = require("../controllers/superadmin.controller");

const auth = require("../middleware/auth.middleware");
const requireSuperAdmin = require("../middleware/requireSuperAdmin");

// Protected routes
router.get("/schools", auth, getAllSchoolsWithDetails);
router.patch(
  "/schools/:schoolId/approve",
  auth,
  requireSuperAdmin,
  approveSchool,
);

router.patch(
  "/schools/:schoolId/suspend",
  auth,
  requireSuperAdmin,
  suspendSchool,
);

router.patch(
  "/schools/:schoolId/deactivate",
  auth,
  requireSuperAdmin,
  deactivateSchool,
);

router.patch(
  "/schools/:schoolId/reject",
  auth,
  requireSuperAdmin,
  rejectSchool,
);

module.exports = router;
