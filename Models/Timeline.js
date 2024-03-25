const mongoose = require("mongoose");

// post
const timelineSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    files: {
        type: Array,
    },
    userId: {
        type: mongoose.Types.ObjectId,
    }
});

const timelineLikeSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Types.ObjectId,
    },
    userId: {
        type: mongoose.Types.ObjectId,
    },
});

// comment
const timelineCommentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
    },
    postId: {
        type: mongoose.Types.ObjectId,
    },
    text: {
        type: String,
    },
    createdAt: {
        type: Date
    },
    images: {
        type: Array
    }
});

const timelineCommentLikeSchema = new mongoose.Schema({
    commentId: {
        type: mongoose.Types.ObjectId,
    },
    userId: {
        type: mongoose.Types.ObjectId,
    },
});

// reply
const timelineReplySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
    },
    postId: {
        type: mongoose.Types.ObjectId,
    },
    commentId: {
        type: mongoose.Types.ObjectId,
    },
    text: {
        type: String,
    },
    createdAt: {
        type: Date
    }
});

const timelineReplyLikeSchema = new mongoose.Schema({
    replyId: {
        type: mongoose.Types.ObjectId,
    },
    userId: {
        type: mongoose.Types.ObjectId,
    },
});


module.exports = {
    // post
    Timeline: mongoose.model("Timeline", timelineSchema),
    TimelineLike: mongoose.model("TimelineLike", timelineLikeSchema),
    // comment
    TimelineComment: mongoose.model("TimelineComment", timelineCommentSchema),
    TimelineCommentLike: mongoose.model("TimelineCommentLike", timelineCommentLikeSchema),
    // reply
    TimelineReply: mongoose.model("TimelineReply", timelineReplySchema),
    TimelineReplyLike: mongoose.model("TimelineReplyLike", timelineReplyLikeSchema),
};