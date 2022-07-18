const express = require('express');
const router = express.Router();
const { createUrl } = require("../controllers/urlController");

router.post("/url/shorten", createUrl);
router.get("/:urlCode", createUrl);

module.exports = router