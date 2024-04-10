const router = require("express").Router();
const { model, Types: { ObjectId } } = require("mongoose");
const Leads = model("Leads");

router.post("/leads", async (req, res) => {
    const { userId, ...rest } = req.body;

    try {
        const result = await Leads.create({
            ...rest, userId: new ObjectId(userId)
        })
        res.status(200).send(result)
    } catch (err) {
        res.status(500).send({ error: err, message: "Internal server error" })
    }
})

router.get("/leads/:userId/:workspace", async (req, res) => {
    const { userId, workspace } = req.params;

    try {
        const result = await Leads.find({ userId: new ObjectId(userId), workspace })
        res.status(200).send(result)
    } catch (err) {
        res.status(500).send({ error: err, message: "Internal server error" })
    }
})

router.get("/lead/:leadId", async (req, res) => {
    const { leadId } = req.params;

    try {
        const result = await Leads.findById(leadId)
        res.status(200).send(result)
    } catch (err) {
        res.status(500).send({ error: err, message: "Internal server error" })
    }
})


module.exports = router;