const express = require('express');
const router = express.Router();
const urlController=require('../controllers/urlController')


router.get("/testme",()=>{
    console.log("test");
});

router.post("/url/shorten",urlController.createUrl)
router.get("/:urlCode",urlController.getdata)
module.exports = router