const router = require("express").Router();
const { model, Types: { ObjectId } } = require("mongoose");
// post
const Timeline = model("Timeline");
const TimelineLike = model("TimelineLike");
// comment
const TimelineComment = model("TimelineComment");
const TimelineCommentLike = model("TimelineCommentLike");
// reply
const TimelineReply = model("TimelineReply");
const TimelineReplyLike = model("TimelineReplyLike");

// post
router.get("/timeline/:limit", async (req, res) => {

    const result = await Timeline.aggregate([
        {
            $match: (req.query?._id ? { _id: { $gt: new ObjectId(req.query?._id) } } : {})
        },
        {
            $lookup: {
                from: 'timelinelikes',
                localField: '_id',
                foreignField: 'postId',
                as: 'likes'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                totalLikes: { $size: '$likes' },
                isMyLike: {
                    $in: [new ObjectId(req.query?.userId), '$likes.userId'] // Check if the user's ID is in the likes' userId array
                },
                user: {
                    name: "$userDetails.name",
                    email: "$userDetails.email",
                    username: "$userDetails.username",
                }
            }
        },
        {
            $project: {
                likes: 0, // Exclude the 'likes' field from the result
                userDetails: 0
            }
        }
    ]).limit(Number(req.params?.limit))

    res.status(200).send(result)
})

router.post("/timeline", async (req, res) => {
    const { title, description, files, userId } = req.body;

    const result = await Timeline.create({ title, description, files, userId })
    res.status(200).send(result)
})

// post likes
router.get("/timeline/like/:postId/:userId", async (req, res) => {
    const { postId, userId } = req.params;

    const total = await TimelineLike.find({ postId: new ObjectId(postId) }).countDocuments()
    const isMyLike = userId ? await TimelineLike.find({
        postId: new ObjectId(postId),
        userId: new ObjectId(userId)
    }).countDocuments() : false

    res.status(200).send({ total, isMyLike: Boolean(isMyLike) })
})

router.post("/timeline/postLike", async (req, res) => {
    const io = req.app.get("io")
    const { _id, userId } = req.body;
    const postId = new ObjectId(_id)

    const result = await TimelineLike.create({ postId, userId: new ObjectId(userId) })
    io?.emit("timelimeLike:create", JSON.stringify(result))
    res.status(200).send(result)
})

router.post("/timeline/postDislike", async (req, res) => {
    const io = req.app.get("io")
    const { _id, userId } = req.body;
    const postId = new ObjectId(_id)

    const result = await TimelineLike.deleteOne({ postId, userId: new ObjectId(userId) })
    io?.emit("timelimeLike:delete", JSON.stringify({ postId: _id, userId }))
    res.status(200).send(result)
})

// comments
router.get("/timeline/comment/:postId/:limit", async (req, res) => {
    const { postId, limit } = req.params;

    const result = await TimelineComment.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $match: req.query?._id ?
                {
                    _id: {
                        $lt: new ObjectId(req.query?._id)
                    },
                    postId: new ObjectId(postId)
                } : {
                    postId: new ObjectId(postId)
                },
        },
        {
            $limit: Number(limit)
        },
        {
            $lookup: {
                from: 'timelinecommentlikes',
                localField: '_id',
                foreignField: 'commentId',
                as: 'likes'
            }
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
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                text: 1,
                images: 1,
                postId: 1,
                createdAt: 1,
                user: {
                    _id: "$user._id",
                    name: "$user.name",
                    email: "$user.email",
                    username: "$user.username",
                },
                totalLikes: { $size: '$likes' },
                // isMyLike: {
                //     $in: [new ObjectId(req.query?.userId), '$likes.userId'] // Check if the user's ID is in the likes' userId array
                // },
            }
        }
    ])

    const totalComments = await TimelineComment.find({
        postId: new ObjectId(postId)
    }).countDocuments()

    res.status(200).send({ result, totalComments })
})

router.post("/timeline/comment", async (req, res) => {
    const io = req.app.get("io")
    const { userId, postId, text, images } = req.body;

    const comment = await TimelineComment.create({
        postId: new ObjectId(postId),
        userId: new ObjectId(userId),
        text,
        images,
        createdAt: new Date()
    })

    const result = await TimelineComment.aggregate([
        {
            $match: { _id: new ObjectId(comment?._id) }
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
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                text: 1,
                images: 1,
                postId: 1,
                createdAt: 1,
                user: {
                    _id: "$user._id",
                    name: "$user.name",
                    email: "$user.email",
                    username: "$user.username",
                }
            }
        }
    ])

    io?.emit("timelineComment:create", JSON.stringify(result))
    res.status(200).send(result)
})

// comment likes
router.get("/timeline/commentLike/:commentId/:userId", async (req, res) => {
    const { commentId, userId } = req.params;
    const total = await TimelineCommentLike.find({ commentId: new ObjectId(commentId) }).countDocuments()

    const isMyLike = userId ? await TimelineCommentLike.find({
        commentId: new ObjectId(commentId),
        userId: new ObjectId(userId)
    }).countDocuments() : false

    res.status(200).send({ total, isMyLike: Boolean(isMyLike) })
})

router.post("/timeline/commentLike", async (req, res) => {
    const io = req.app.get("io")
    const { _id, userId } = req.body;
    const commentId = new ObjectId(_id)

    const result = await TimelineCommentLike.create({ commentId, userId: new ObjectId(userId) })
    io?.emit("timelimeCommentLike:create", JSON.stringify(result))
    res.status(200).send(result)
})

router.post("/timeline/commentDislike", async (req, res) => {
    const io = req.app.get("io")
    const { _id, userId } = req.body;
    const commentId = new ObjectId(_id)

    const result = await TimelineCommentLike.deleteOne({ commentId, userId: new ObjectId(userId) })
    io?.emit("timelimeCommentLike:delete", JSON.stringify({ commentId: _id, userId }))
    res.status(200).send(result)
})

// reply
router.get("/timeline/reply/:postId/:commentId/:limit", async (req, res) => {
    const { commentId, postId, limit } = req.params;
    const result = await TimelineReply.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $match: req.query?._id ?
                {
                    _id: {
                        $lt: new ObjectId(req.query?._id)
                    },
                    commentId: new ObjectId(commentId),
                    postId: new ObjectId(postId)
                } : {
                    commentId: new ObjectId(commentId),
                    postId: new ObjectId(postId)
                },
        },
        {
            $limit: Number(limit)
        },
        {
            $lookup: {
                from: 'timelinereplylikes',
                localField: '_id',
                foreignField: 'replyId',
                as: 'likes'
            }
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
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                text: 1,
                postId: 1,
                createdAt: 1,
                user: {
                    _id: "$user._id",
                    name: "$user.name",
                    email: "$user.email",
                    username: "$user.username",
                },
                totalLikes: { $size: '$likes' },
                // isMyLike: {
                //     $in: [new ObjectId(req.query?.userId), '$likes.userId'] // Check if the user's ID is in the likes' userId array
                // },
            }
        }
    ])

    const totalReplies = await TimelineReply.find({
        commentId: new ObjectId(commentId),
        postId: new ObjectId(postId)
    }).countDocuments()

    res.status(200).send({ result, totalReplies })
})

router.post("/timeline/reply", async (req, res) => {
    const io = req.app.get("io")
    const { userId, commentId, postId, text } = req.body;

    const reply = await TimelineReply.create({
        postId: new ObjectId(postId),
        commentId: new ObjectId(commentId),
        userId: new ObjectId(userId),
        text,
        createdAt: new Date()
    })

    const result = await TimelineReply.aggregate([
        {
            $match: { _id: new ObjectId(reply?._id) }
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
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                text: 1,
                commentId: 1,
                createdAt: 1,
                user: {
                    _id: "$user._id",
                    name: "$user.name",
                    email: "$user.email",
                    username: "$user.username",
                }
            }
        }
    ])

    const totalReplies = await TimelineReply.find({
        commentId: new ObjectId(commentId),
        postId: new ObjectId(postId)
    }).countDocuments()

    io?.emit("timelineReply:create", JSON.stringify({ result: result[0], totalReplies }))
    res.status(200).send(result)
})

// reply likes
router.get("/timeline/replyLike/:replyId/:userId", async (req, res) => {
    const { replyId, userId } = req.params;
    const total = await TimelineReplyLike.find({ replyId: new ObjectId(replyId) }).countDocuments()

    const isMyLike = userId ? await TimelineReplyLike.find({
        replyId: new ObjectId(replyId),
        userId: new ObjectId(userId)
    }).countDocuments() : false

    res.status(200).send({ total, isMyLike: Boolean(isMyLike) })
})

router.post("/timeline/replyLike", async (req, res) => {
    const io = req.app.get("io")
    const { _id, userId } = req.body;
    const replyId = new ObjectId(_id)

    const result = await TimelineReplyLike.create({ replyId, userId: new ObjectId(userId) })
    io?.emit("timelimeReplyLike:create", JSON.stringify(result))
    res.status(200).send(result)
})

router.post("/timeline/replyDislike", async (req, res) => {
    const io = req.app.get("io")
    const { _id, userId } = req.body;
    const replyId = new ObjectId(_id)

    const result = await TimelineReplyLike.deleteOne({ replyId, userId: new ObjectId(userId) })
    io?.emit("timelimeReplyLike:delete", JSON.stringify({ replyId: _id, userId }))
    res.status(200).send(result)
})

module.exports = router 