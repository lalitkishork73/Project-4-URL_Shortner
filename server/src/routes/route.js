//------------------- Importing Modules -------------------//

const express = require("express");
const router = express.Router();
const { createUrl, getUrl,getAllUrl } = require("../controllers/urlController");

//------------------- API and Method Routes-------------------//

router.post("/url/shorten", createUrl);
router.get("/url", getAllUrl);
router.get("/:urlCode", getUrl);

//------------------- Exporting Modules -------------------//

module.exports = router;
