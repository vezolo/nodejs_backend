const { Schema, model, Types: { ObjectId } } = require("mongoose");

const chatSchema = new Schema({
    for: [{
        type: ObjectId
    }],
    fromId: {
        type: ObjectId
    },
    toId: {
        type: ObjectId
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

const groupChatSchema = new Schema({
    fromId: {
        type: ObjectId
    },
    toId: {
        type: ObjectId
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

const groupSchema = new Schema({
    title: {
        type: String
    },
    admins: {
        type: [ObjectId]
    },
    createdAt: {
        type: Date
    }
})

const groupMemberSchema = new Schema({
    userId: {
        type: ObjectId
    },
    groupId: {
        type: ObjectId
    },
    createdAt: {
        type: Date
    }
})

const UnitChatSchema = new Schema({
    fromId: {
        type: ObjectId
    },
    toId: {
        type: ObjectId
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

const UnitSchema = new Schema({
    title: {
        type: String
    },
    createdAt: {
        type: Date
    }
})

const UnitMemberSchema = new Schema({
    userId: {
        type: ObjectId
    },
    groupId: {
        type: ObjectId
    },
    role: {
        type: String
    },
    createdAt: {
        type: Date
    }
})

module.exports = {
    Chat: model("Chat", chatSchema),
    Group: model("Group", groupSchema),
    GroupChat: model("GroupChat", groupChatSchema),
    GroupMembers: model("GroupMembers", groupMemberSchema),
    UnitSchema: model("Unit", UnitSchema),
    UnitChatSchema: model("UnitChat", UnitChatSchema),
    UnitMemberSchema: model("UnitMembers", UnitMemberSchema),
};