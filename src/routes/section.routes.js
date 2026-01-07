// addSection

const router = require("express").Router();
const { addSection } = require("../controllers/section.controller");

router.post("/", addSection);

module.exports = router;
