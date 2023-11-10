const express = require("express");
const router = express.Router();

router.get("/hello", (req, res) => {
    console.log("hello")
    io = req.io

    res.send("hello")
})

module.exports = router;