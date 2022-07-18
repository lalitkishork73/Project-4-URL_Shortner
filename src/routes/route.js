const express = require('express');
const router = express.Router();

router.get("/testme",()=>{
    console.log("test");
});

module.exports = router