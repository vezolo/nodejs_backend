const mongoose = require("mongoose");
const Otp = mongoose.model("Otp");
const User = mongoose.model("User");
const { default: ObjectID } = require("bson-objectid");
const bcrypt = require("bcrypt")

const signUp = async (req, res) => {
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
}

module.exports = { signUp }