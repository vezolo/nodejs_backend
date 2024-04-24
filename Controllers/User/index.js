const { model, Types: { ObjectId } } = require("mongoose");
const User = model("User");

const getAllUsers = async (req, res) => {
    const { limit } = req.query
    const user = await User.find(
        req.query?._id ?
            { _id: { $gt: new ObjectId(req.query._id) } } :
            { email: { $nin: [req.query.not], } })
        .limit(limit);
    res.status(200).send(user)
}

const getUserById = async (req, res) => {
    const user = await User.findById(req.params?._id, '-password');
    res.status(200).send(user)
}

const checkUser = async (req, res) => {
    if (req.query?.email) {
        const user = await User.findOne({ email: req.query.email }, '-password').countDocuments();
        if (user > 0) {
            res.status(200).send({ exist: true })
        } else {
            res.status(200).send({ exist: false })
        }
    } else if (req.query?.username) {
        const user = await User.findOne({ username: req.query.username }, '-password').countDocuments();
        if (user > 0) {
            res.status(200).send({ exist: true })
        } else {
            res.status(200).send({ exist: false })
        }
    }
}

const updateUser = async (req, res) => {
    const { _id, toUpdate } = req.body;
    await User.updateOne(
        { _id: new ObjectId(_id) },
        { $set: toUpdate },
    )
    const result = await User.findById(new ObjectId(_id), '-password')
    res.status(200).send(result)
}

module.exports = { getAllUsers, getUserById, updateUser, checkUser }