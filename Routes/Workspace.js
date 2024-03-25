const router = require("express").Router();
const { model, Types: { ObjectId } } = require("mongoose");
const Workspace = model("Workspace");

router.post("/workspace", async (req, res) => {
    try {
        const result = await Workspace.create({ ...req.body, verified: { status: 'pending', date: new Date() } })
        res.status(200).send(result)
    } catch (err) {
        if (err.code == 11000) {
            res.status(409).send({ error: err, message: "Workspace name already exists" })
        } else {
            res.status(500).send({ error: err, message: "Internal server error" })
        }
    }
})

router.get("/workspace/:email", async (req, res) => {
    const { email } = req.params;

    const result = await Workspace.find({ createdBy: email });
    res.status(200).send(result)
})

router.get("/workspace/:query", async (req, res) => {
    const { query } = req.params;

    const result = await Workspace.findOne({ _id: new ObjectId(query) });
    res.status(200).send(result)
})

router.put("/workspace", async (req, res) => {
    const { _id, toUpdate } = req.body;

    await Workspace.updateOne(
        { _id: new ObjectId(_id) },
        {
            $set: toUpdate
        },
    )

    const result = await Workspace.findById(new ObjectId(_id))

    res.status(200).send(result)
})

module.exports = router;