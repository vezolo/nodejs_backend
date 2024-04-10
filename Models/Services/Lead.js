const { Schema, model, Types: { ObjectId } } = require("mongoose");

const schema = new Schema({
    user: {
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
        },
        company: {
            type: String,
        }
    },
    lead: {
        source: {
            type: String,
        },
        rating: {
            type: String,
        }
    },
    createdAt: {
        type: Date,
    },
    userId: {
        type: ObjectId,
    },
    workspace: {
        type: String,
    }
});

module.exports = { Leads: model("Leads", schema) };