const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    for: {
        type: mongoose.Types.ObjectId
    },
    fromId: {
        type: mongoose.Types.ObjectId
    },
    toId: {
        type: mongoose.Types.ObjectId
    },
    status: {
        type: String
    },
    message: {
        type: String
    },
    files: {
        type: Array
    },
    images: {
        type: Array
    },
    createdAt: {
        type: Date
    },
    seen: {
        type: Boolean
    }
})

const groupChatSchema = new mongoose.Schema({
    fromId: {
        type: mongoose.Types.ObjectId
    },
    toId: {
        type: mongoose.Types.ObjectId
    },
    status: {
        type: String
    },
    message: {
        type: String
    },
    files: {
        type: Array
    },
    images: {
        type: Array
    },
    createdAt: {
        type: Date
    },
})

const groupSchema = new mongoose.Schema({
    title: {
        type: String
    },
    admins: {
        type: [mongoose.Types.ObjectId]
    },
    createdAt: {
        type: Date
    }
})

const groupMemberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId
    },
    groupId: {
        type: mongoose.Types.ObjectId
    },
    createdAt: {
        type: Date
    }
})

module.exports = {
    Chat: mongoose.model("Chat", chatSchema),
    Group: mongoose.model("Group", groupSchema),
    GroupChat: mongoose.model("GroupChat", groupChatSchema),
    GroupMembers: mongoose.model("GroupMembers", groupMemberSchema),
};