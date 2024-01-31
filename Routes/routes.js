const express = require("express");
const router = express.Router();
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

router.use(require("./Connection"))
router.use(require("./Chat"))

module.exports = router;