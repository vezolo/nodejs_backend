const router = require("express").Router();
const { model, Types: { ObjectId } } = require("mongoose");
const Connection = model("Connection");
const User = model("User");

router.get("/connection/:user", async (req, res) => {
    const { user } = req.params
    const userId = new ObjectId(user)

    const sentUser = await Connection.aggregate([
        {
            $match: { fromId: userId, status: "sent" }
        },
        {
            $lookup: {
                from: 'users',
                localField: "toId",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: "$userDetails._id",
                name: "$userDetails.name",
                email: "$userDetails.email",
                username: "$userDetails.username",
            }
        }
    ])

    const recievedUser = await Connection.aggregate([
        {
            $match: { toId: userId, status: "sent" }
        },
        {
            $lookup: {
                from: 'users',
                localField: "fromId",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: "$userDetails._id",
                name: "$userDetails.name",
                email: "$userDetails.email",
                username: "$userDetails.username",
            }
        }
    ])

    const connectedUserFrom = await Connection.aggregate([
        {
            $match: { fromId: userId, status: "connected" }
        },
        {
            $lookup: {
                from: 'users',
                localField: "toId",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: "$userDetails._id",
                name: "$userDetails.name",
                email: "$userDetails.email",
                username: "$userDetails.username",
            }
        }
    ])

    const connectedUserTo = await Connection.aggregate([
        {
            $match: { toId: userId, status: "connected" }
        },
        {
            $lookup: {
                from: 'users',
                localField: "fromId",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: "$userDetails._id",
                name: "$userDetails.name",
                email: "$userDetails.email",
                username: "$userDetails.username",
            }
        }
    ])

    res.status(200).send({ sentUser, recievedUser, connectedUserFrom, connectedUserTo, connections: [...connectedUserFrom, ...connectedUserTo] })
})

router.post("/connection", async (req, res) => {
    const io = req.app.get("io")

    const { from, to, status } = req.body

    const fromId = new ObjectId(from)
    const toId = new ObjectId(to);

    const result = await Connection.create({
        fromId, toId, status, createdAt: new Date()
    })

    if (result) {
        const fromUserId = await User.findOne({ _id: fromId })
        const toUser = await User.findOne({ _id: toId })

        const data = {
            from: [fromUserId]?.map(({ _id, name, email, username }) => ({ _id, name, email, username }))[0],
            to: [toUser]?.map(({ _id, name, email, username }) => ({ _id, name, email, username }))[0]
        }

        io.emit("addConnection", JSON.stringify(data))

        res.status(200).send(data)
    } else {
        res.status(404)
    }

})

router.delete("/connection/:from/:to/:actionType", async (req, res) => {
    const io = req.app.get("io")
    const { from, to, actionType } = req.params

    const result = await Connection.deleteOne({ fromId: new ObjectId(from), toId: new ObjectId(to) })

    if (result) {
        const fromUser = await User.findOne({ _id: new ObjectId(from) })
        const toUser = await User.findOne({ _id: new ObjectId(to) })

        const data = {
            from: [fromUser]?.map(({ _id, name, email, username }) => ({ _id, name, email, username }))[0],
            to: [toUser]?.map(({ _id, name, email, username }) => ({ _id, name, email, username }))[0]
        }

        io.emit("deleteConnection", JSON.stringify(data), actionType)

        res.status(200).send(data)
    } else {
        res.status(404)
    }
})

router.put("/connection", async (req, res) => {
    const io = req.app.get("io")
    const { from, to, status } = req.body

    const fromId = new ObjectId(from)
    const toId = new ObjectId(to);

    const result = await Connection.updateOne({
        fromId, toId
    }, {
        $set: {
            status
        }
    })

    if (result) {
        const fromUserId = await User.findOne({ _id: fromId })
        const toUser = await User.findOne({ _id: toId })

        const data = {
            from: [fromUserId]?.map(({ _id, name, email, username }) => ({ _id, name, email, username }))[0],
            to: [toUser]?.map(({ _id, name, email, username }) => ({ _id, name, email, username }))[0]
        }

        io.emit("updateConnection", JSON.stringify(data))

        res.status(200).send(data)
    } else {
        res.status(404)
    }
})

module.exports = router 