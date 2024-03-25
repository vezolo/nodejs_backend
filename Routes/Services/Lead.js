const router = require("express").Router();
const { model, Types: { ObjectId } } = require("mongoose");
const Leads = model("Leads");

router.post("/leads", async (req, res) => {
    const { createdBy, ...rest } = req.body;

    try {
        const result = await Leads.create({
            ...rest, createdBy: new ObjectId(createdBy)
        })
        res.status(200).send(result)
    } catch (err) {
        res.status(500).send({ error: err, message: "Internal server error" })
    }
})


module.exports = router;