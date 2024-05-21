// Answer Document Schema
const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
    text: {type: String, required: true},
    ans_by: {type: String, required: true},
    votes: {type: Number, default: 0},
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]

}, {
    timestamps: {
      createdAt: 'ans_date_time',
    }
  });

AnswerSchema.virtual("url").get(function() {
    return "posts/answer/" + this._id;
});

module.exports = mongoose.model("Answer", AnswerSchema);