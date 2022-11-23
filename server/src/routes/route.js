//------------------- Importing Modules -------------------//

const express = require("express");
const router = express.Router();
const { createUrl, getUrl,getUrlByLongU } = require("../controllers/urlController");

//------------------- API and Method Routes-------------------//

router.post("/url/shorten", createUrl);
router.get("/:urlCode", getUrl);
router.get("/url", getUrlByLongU);

//------------------- Exporting Modules -------------------//

module.exports = router;
