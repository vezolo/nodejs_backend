const express = require("express");
const router = express.Router();

const { sendOtp } = require("../../Controllers/Auth");
const { signUp } = require("../../Controllers/Auth/signup");
const { signIn } = require("../../Controllers/Auth/signIn");

router.post("/signup", signUp);
router.post("/otp", sendOtp)
router.post("/signin", signIn);

module.exports = router;
