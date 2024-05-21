// Comment Document Schema
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    text: {type: String, required: true},
    create_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    votes: {type: Number, default: 0},
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: {
      createdAt: 'create_date_time',
    }
  });

  CommentSchema.virtual("url").get(function() {
    return "posts/comment/" + this._id;
});

module.exports = mongoose.model("Comment", CommentSchema);