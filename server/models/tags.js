// Tag Document Schema
const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema({
    name: {type: String, required: true}
});

TagSchema.virtual("url").get(function() {
    return "posts/tag/" + this._id;
});

module.exports = mongoose.model("Tag", TagSchema);