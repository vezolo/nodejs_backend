const router = require("express").Router();
const { model, Types: { ObjectId } } = require("mongoose");
const User = model("User");
const Chat = model("Chat");
const Connection = model("Connection");
const Group = model("Group");
const GroupChat = model("GroupChat");
const GroupMembers = model("GroupMembers");

router.get("/chat/:loggedUser/:connectedUser", async (req, res) => {
    const { loggedUser, connectedUser } = req.params

    const loggedId = new ObjectId(loggedUser)
    const connectedId = new ObjectId(connectedUser);

    const resultFrom = await Chat.find({
        for: loggedId, fromId: loggedId, toId: connectedId,
    })

    const resultTo = await Chat.find({
        for: loggedId, fromId: connectedId, toId: loggedId,
    })

    if (resultFrom && resultTo) {
        res.status(200).send([...resultFrom, ...resultTo])
    } else {
        res.status(404)
    }

})

router.get("/chat:list/:_id", async (req, res) => {
    const { _id } = req.params

    const userId = new ObjectId(_id)

    const connectedUser = await Connection.aggregate([
        {
            $match: {
                $or: [
                    { fromId: userId, status: "connected" },
                    { toId: userId, status: "connected" },
                ]
            }
        },
        {
            $lookup: {
                from: 'users',
                let: {
                    fromId: "$fromId",
                    toId: "$toId"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$_id", "$$fromId"] },
                                    { $eq: ["$_id", "$$toId"] },
                                ],
                            }
                        }
                    }
                ],
                as: "user"
            }
        },
        {
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'chats',
                let: {
                    userId: "$user._id"
                },
                pipeline: [
                    {
                        $match: {
                            for: userId,
                            $expr: {
                                $or: [
                                    {
                                        $and: [
                                            { $eq: ["$fromId", "$$userId"] },
                                            { $eq: ["$toId", userId] },
                                        ],
                                    },
                                    {
                                        $and: [
                                            { $eq: ["$fromId", userId] },
                                            { $eq: ["$toId", "$$userId"] },
                                        ],
                                    }
                                ],
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            message: 1,
                            toId: 1,
                            fromId: 1,
                            seen: { $ifNull: ["$seen", false] }
                        }
                    }
                ],
                as: "chat"
            }
        },
        {
            $project: {
                _id: "$user._id",
                name: "$user.name",
                email: "$user.email",
                username: "$user.username",
                chatCount: {
                    $size: {
                        $filter: {
                            input: '$chat',
                            as: "chats",
                            cond: {
                                $and: [{ $eq: ["$$chats.seen", false] }, { $eq: ["$$chats.fromId", "$user._id"] }]
                            }
                        }
                    }
                },
                lastChat: {
                    $arrayElemAt: [
                        '$chat',
                        -1
                    ]
                }
            }
        },
    ])

    res.status(200).send(connectedUser)
})

router.post("/chat", async (req, res) => {
    const io = req.app.get("io")

    const { from, to, message, files, images, sendId, createdAt } = req.body

    const fromId = new ObjectId(from)
    const toId = new ObjectId(to);

    const resultFrom = await Chat.create({
        for: fromId, fromId, toId, status: 'sent', message, files, images, createdAt
    })

    const resultTo = await Chat.create({
        for: toId, fromId, toId, status: 'sent', message, files, images, createdAt
    })

    if (resultFrom && resultTo) {
        io?.emit("chat:create", JSON.stringify([{ ...resultFrom._doc, sendId }, resultTo]))
        res.status(200).send()
    } else {
        res.status(404)
    }
})

router.put("/chat", async (req, res) => {
    const io = req.app.get("io")

    const { from, to, toUpdate } = req.body

    const fromId = new ObjectId(from)
    const toId = new ObjectId(to)

    const result = await Chat.updateMany(
        { fromId, toId },
        {
            $set: toUpdate
        })

    if (result) {
        io?.emit("chat:update", JSON.stringify({ from, to, toUpdate }))
    }
    if (true) {
        res.status(200).send()
    } else {
        res.status(404)
    }
})

router.get("/groupchat:list/:_id", async (req, res) => {
    const { _id } = req.params

    const userId = new ObjectId(_id)

    const groups = await Group.aggregate([
        {
            $lookup: {
                from: 'groupmembers',
                localField: '_id',
                foreignField: 'groupId',
                as: 'groupMembers'
            }
        },
        {
            $match: {
                $or: [
                    { admins: { $elemMatch: { $eq: userId } } },
                    { 'groupMembers.userId': userId },
                ]
            }
        },
        {
            $lookup: {
                from: 'groupchats',
                localField: "_id",
                foreignField: "toId",
                as: "chat"
            }
        },
        {
            $project: {
                _id: "$_id",
                title: "$title",
                admins: "$admins",
                type: "group",
                createdAt: "$createdAt",
                // groupMembers: {
                //     $filter: {
                //         input: '$groupMembers',
                //         as: 'groupMember',
                //         cond: { $eq: ['$$groupMember.userId', userId] }
                //     }
                // },
                lastChat: {
                    $arrayElemAt: [
                        '$chat',
                        -1
                    ]
                }
            }
        },
    ])

    console.log(groups)

    res.status(200).send(groups)
})

router.get("/groupchat/:loggedUser/:groupId", async (req, res) => {
    const { loggedUser, groupId } = req.params

    const loggedId = new ObjectId(loggedUser)
    const connectedId = new ObjectId(groupId);

    const result = await GroupChat.aggregate([
        {
            $match: { toId: connectedId }
        },
        {
            $lookup: {
                from: "users",
                localField: "fromId",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                _id: 1,
                message: 1,
                fromId: 1,
                toId: 1,
                images: 1,
                files: 1,
                status: 1,
                createdAt: 1,
                userId: "$user._id",
                name: "$user.name",
                email: "$user.email",
                username: "$user.username",
            }
        }
    ])

    if (result) {
        res.status(200).send(result)
    } else {
        res.status(404)
    }

})

router.post("/groupchat", async (req, res) => {
    const { ...rest } = req.body

    const result = await Group.create({
        ...rest,
        createdAt: new Date()
    })

    if (result) {
        res.status(200).send(result)
    } else {
        res.status(404)
    }
})

router.post("/group/chat", async (req, res) => {
    const io = req.app.get("io")

    const { from, to, message, files, images, sendId, createdAt } = req.body

    const fromId = new ObjectId(from)
    const toId = new ObjectId(to);

    const result = await GroupChat.create({
        fromId, toId, status: 'sent', message, files, images, createdAt
    })

    if (result) {
        io?.emit("groupchat:create", JSON.stringify([{ ...result._doc, sendId }]))
        res.status(200).send()
    } else {
        res.status(404)
    }
})

router.post("/group/members", async (req, res) => {
    const io = req.app.get("io")

    const { members, _id } = req.body

    const groupId = new ObjectId(_id)
    const membersId = members?.map(item => new ObjectId(item))

    const insertPromises = membersId.map(async member => {
        const newMember = new GroupMembers({
            userId: member,
            groupId
        });
        return await newMember.save();
    });

    await Promise.all(insertPromises);

    const users = await User.aggregate([
        {
            $match: { _id: { $in: membersId } }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                username: 1,
                email: 1
            }
        }
    ])

    if (true) {
        io?.emit("group/members:create", JSON.stringify(users))
        res.status(200).send(users)
    } else {
        res.status(404)
    }
})


router.get("/group/:groupId/members", async (req, res) => {

    const { groupId } = req.params

    const users = await GroupMembers.aggregate([
        {
            $match: { groupId: new ObjectId(groupId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                _id: "$user._id",
                name: "$user.name",
                username: "$user.username",
                email: "$user.email",
            }
        }
    ])

    if (users) {
        res.status(200).send(users)
    } else {
        res.status(404)
    }
})

module.exports = router