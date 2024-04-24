
const mongoose = require("mongoose");
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");
const jwtkey = process.env.JWTKEY

const signIn = async (req, res) => {
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
}

module.exports = { signIn }