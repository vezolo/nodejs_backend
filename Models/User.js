const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    profileImg: {
        type: Object,
    },
    name: {
        type: String,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    },
    gender: {
        type: String,
    },
    dob: {
        type: String,
    },
    profession: {
        type: String,
    },
    professionType: {
        type: String,
    },
    company: {
        type: String,
    },
    skills: {
        type: Array,
    },
    portfolio: {
        type: String,
    },
    hobbies: {
        type: Array,
    },
    causes: {
        type: Array,
    },
    languages: {
        type: Array,
    },
    location: {
        type: String,
    },
    verificationFileIndividual: {
        type: Array,
    },
    verificationFileBusiness: {
        type: Array,
    },
    designation: {
        type: String,
    },
    sites: {
        type: Object,
    },
});

userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword) {
    const user = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
            if (err) {
                return reject(err);
            } else if (!isMatch) {
                return reject(err);
            }
            resolve(true);
        });
    });
};

const connectionSchema = new mongoose.Schema({
    fromId: {
        type: mongoose.Types.ObjectId
    },
    toId: {
        type: mongoose.Types.ObjectId
    },
    status: {
        type: String
    },
    createdAt: {
        type: Date
    },
})

module.exports = { Users: mongoose.model("User", userSchema), Connection:  mongoose.model("Connection", connectionSchema) };
