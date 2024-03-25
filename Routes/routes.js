const express = require("express");
const router = express.Router();

router.use(require("./User"))
router.use(require("./Connection"))
router.use(require("./Chat"))
router.use(require("./Timeline"))
router.use(require("./Workspace"))
router.use(require("./Services/Lead"))

module.exports = router;