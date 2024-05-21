// Question Document Schema
const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    title: {type: String, required: true, maxLength: 50},
    summary: {type: String, required: true, maxLength: 140},
    text: {type: String, required: true},
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: "Tag", required: true}],
    answers: [{type: mongoose.Schema.Types.ObjectId, ref: "Answer"}],
    asked_by: {type: String, default: "Anonymous"},
    views: {type: Number, default: 0},
    votes: {type: Number, default: 0},
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, {
    timestamps: {
      createdAt: 'ask_date_time',
    }
  });


QuestionSchema.virtual("url").get(function() {
    return "posts/question/" + this._id;
});

module.exports = mongoose.model("Question", QuestionSchema);