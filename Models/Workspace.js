const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
    image: {
        type: Object,
    },
    name: {
        workspace: {
            type: String,
            unique: true
        },
        entity: {
            type: String,
            unique: true
        }
    },
    type: {
        acc: {
            type: String,
        },
        sector: {
            type: String,
        },
        entity: {
            type: String,
        },
    },
    address: {
        country: {
            type: String,
        },
        address: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        zip: {
            type: Number,
        },
    },
    regId: {
        regNo: {
            type: String,
        },
    },
    contact: {
        phone: {
            type: String,
        },
        telephone: {
            type: String,
        }
    },
    verified: {
        status: {
            type: String
        },
        date: {
            type: Date
        }
    },
    createdBy: {
        type: String,
    },
});

module.exports = { Workspace: mongoose.model("Workspace", workspaceSchema) };
