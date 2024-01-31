const express = require("express");
const router = express.Router();
const crypto = require("crypto")
const bcrypt = require("bcrypt")

const mongoose = require("mongoose");
const Otp = mongoose.model("Otp");
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");
const { default: ObjectID } = require("bson-objectid");
const mail = require("../../Functions/mail");
const jwtkey = process.env.JWTKEY

router.post("/signup", async (req, res) => {
    const { otpNum, ...body } = req.body;

    try {
        const otp = await Otp.findOne({ email: body?.email })

        if (new Date(otp?.expiry) >= new Date()) {

            const otpMatch = await bcrypt.compare(
                otpNum.toString(),
                otp?.otp
            );

            if (otpMatch) {
                const user = new User(body);
                await user.save();
                const token = jwt.sign({ userId: user._id }, jwtkey);

                await Otp.deleteOne({ _id: new ObjectID(otp?._id) })

                res.status(200).send({ status: 200, token, user });
            }
            else {
                res.status(200).send({ status: 404, message: "Otp is not correct" })
            }
        } else {
            res.status(200).send({ status: 404, message: "Otp is expired" })
        }
    } catch (err) {
        return res.status(422).send({ status: 422, message: `Something error happend: ${err}` });
    }
});

router.post("/otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res
            .status(422)
            .send({ status: 422, error: "Must provide email" });
    }

    const user = await User.findOne({ email });

    if (user) {
        return res
            .status(200)
            .send({ status: 404, error: "User Already Registered" });
    }

    try {
        const otp = crypto.randomInt(100000, 999999);

        await mail({ email, html: String(otp), sub: "Otp" })

        const hashedOtp = await bcrypt.hash(otp.toString(), 10);

        await Otp.updateOne(
            { email },
            {
                $set: {
                    otp: hashedOtp,
                    expiry: Date.now() + 10 * 60 * 1000, // OTP expires after 10 minutes
                }
            },
            {
                upsert: true
            })

        res.status(200).send({ status: 200 });
    } catch (err) {
        return res
            .status(422)
            .send({ status: 422, error: "Something Wrong" });
    }
})

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
        const userDetails = [user?._doc]?.map(({ _id, email, name, username }) => ({ _id, email, name, username }))[0];

        const token = jwt.sign({ userId: user._id }, jwtkey);
        res.status(200).send({ status: 200, token, user: userDetails });
    } catch (err) {
        return res
            .status(422)
            .send({ status: false, error: "Incorrect Credentials" });
    }
});

module.exports = router;
