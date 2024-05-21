// User Document Schema
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    userName: {type: String, required: true, maxLength: 50},
    password: {type: String, required: true},
    reputation: {type: Number, default: 50},
    isAdmin: {type: Boolean, default: false},
    tagsCreated: [{type: mongoose.Schema.Types.ObjectId, ref: "Tag"}],
}, {
    timestamps: true
  });


module.exports = mongoose.model("User", UserSchema);