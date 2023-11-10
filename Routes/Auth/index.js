const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");
const jwtkey = process.env.JWTKEY

router.post("/signup", async (req, res) => {
    const body = req.body;

    try {
        const user = new User(body);
        await user.save();
        const token = jwt.sign({ userId: user._id }, jwtkey);
        res.send({ token, user });
    } catch (err) {
        return res.status(422).send(`Something error happend: ${err}`);
    }
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res
            .status(422)
            .send({ status: false, error: "Must provide email or password" });
    }
    const user = await User.findOne({ email });

    if (!user) {
        return res
            .status(422)
            .send({ status: false, error: "User not found" });
    }

    try {
        await user.comparePassword(password);

        const token = jwt.sign({ userId: user._id }, jwtkey);
        res.status(200).send({ status: true, token, user });
    } catch (err) {
        return res
            .status(422)
            .send({ status: false, error: "Incorrect Credentials" });
    }
});

module.exports = router;
