const router = require("express").Router();
const { model, Types: { ObjectId } } = require("mongoose");
const User = model("User");

router.get("/users", async (req, res) => {
    const user = await User.find(
        req.query?._id ?
            { _id: { $gt: new ObjectId(req.query._id) } } :
            { email: { $nin: [req.query.not], } })
        .limit(req.query?.limit);
    res.status(200).send(user)
})

router.post("/user", async (req, res) => {
    const { _id } = req.body;

    const user = await User.findById().limit(req.query?.limit);
    res.status(200).send(user)
})

router.get("/user/:_id", async (req, res) => {
    const { _id } = req.params;
    console.log(_id)

    const user = await User.findById(_id, '-password');
    res.status(200).send(user)
})

router.put("/user", async (req, res) => {
    const { _id, toUpdate } = req.body;

    await User.updateOne(
        { _id: new ObjectId(_id) },
        {
            $set: toUpdate
        },
    )

    const result = await User.findById(new ObjectId(_id), '-password')

    res.status(200).send(result)
})

module.exports = router;