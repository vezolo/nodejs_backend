const { model } = require("mongoose");
const User = model("User");
const Otp = model("Otp");
const mail = require("../../Functions/mail");
const crypto = require("crypto")
const bcrypt = require("bcrypt");
const { validateEmail } = require("../../Functions/validations");

const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(422).send({ status: 422, error: "Must provide email" });
    }

    if (!validateEmail(email)) {
        return res
            .status(422)
            .send({ status: false, error: "Email domain seems invalid" });
    }

    const user = await User.findOne({ email });
    if (user) {
        return res.status(404).send({ status: 404, error: "User Already Registered" });
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
            .send({ status: 422, error: err, });
    }
}

module.exports = { sendOtp }