// Application server
// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
require("dotenv").config()

const app = express();

let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let User = require('./models/users')
let Comment = require('./models/comments')


// cookie parser
app.use(cookieParser());

// Cors middleware
app.use(cors(
    {
    credentials: true,
    origin: "http://localhost:3000"
    }
));


// json middleware
app.use(express.json());



//Database connection
mongoose.connect("mongodb://127.0.0.1/fake_so", {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


//authentication middleware
function isAuthenticated(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({errorMessage: "No token"})
        }
        const verified = jwt.verify(token, process.env.SECRET_KEY)
        next();

        } catch (err) {
        console.log(err);
        return res.status(401).json({errorMessage: "Unauthorized"})
    }
        
}

// helper functions
const deleteUnusedTags = async () => {
    const allQs = await Question.find();
    const allTags = await Tag.find();
    //Delete any tag that is not used by any question
    const tagsToDelete = allTags.filter((tag) => {
        let res = !(allQs.some((q) => {
            return q.tags.includes(tag._id);
        }));
        return res
    });

    tagsToDelete.forEach(async (tag) => {
        await Tag.deleteOne({_id: tag._id});
    });
}

const tagBeingUsed = async (tid) => {
    const allQs = await Question.find();
    const tag = await Tag.findById(tid);
    //Return true if tag is not being used by anyone else, false otherwise
    let uniqueUsers = [];
    allQs.forEach((q) => {
        if (q.tags.includes(tag._id)) {
            if (!uniqueUsers.includes(q.asked_by)) {
                uniqueUsers.push(q.asked_by);
            }
            
        }
    });
    if (uniqueUsers.length != 1) {
        return true;
    } else {
        return false;
    }

}

const deleteComment = async (cid) => {
    await Comment.deleteOne({_id: cid});
}

const deleteAnswer = async (aid) => {
    await Answer.deleteOne({_id: aid});
}

const deleteQuestion = async (qid) => {
    const question = await Question.findById(qid);
    //delete all comments for question
    question.comments.forEach(async (comment) => await deleteComment(comment._id))
    //delete answers 
    question.answers.forEach(async (answer) => await deleteAnswer(answer._id));
    //delete question
    await Question.deleteOne({_id: qid});
    //delete unused tags
    await deleteUnusedTags();
}

const getUserQuestions = async (uid) => {
    const user = await User.findById(uid);
    const userName = user.userName;
    const allQuestions = await Question.find();
    return allQuestions.filter((q) => q.asked_by === userName)
}

const getUserAnswers = async (uid) => {
    const user = await User.findById(uid);
    const userName = user.userName;
    const allAnswers = await Answer.find();
    return allAnswers.filter((a) => a.ans_by === userName)
}

const getUserComments = async (uid) => {
    const user = await User.findById(uid);
    const userComments = await Comment.find({create_by: user._id});
    return userComments;
}



//routes

app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.get("/questions", async function (req, res) {
    const questions = await Question.find().populate("tags").populate("answers").populate("comments");
    res.send(questions);
});

app.post("/questions", isAuthenticated, async function (req, res) {
    //find the user
    const userId = jwt.decode(req.cookies.token).userId;
    const user = await User.findById(userId);

    try {
        const tagNames = req.body.tagNames.map((tagName) => tagName.toLowerCase());
        uniqueTagNames = tagNames.filter(function(elem, pos) {
            return tagNames.indexOf(elem) == pos;
        })
        const tagIds = await Promise.all(uniqueTagNames.map(async (tagName) => {
            const tag = await Tag.findOne({name: tagName});
            // tag already exists
            if (tag) {
                return tag._id;
            }
            // make a new tag if user has rep more than 50 
            else {
                if (user.reputation < 50) {
                    // send the error from server because you cant create a new tag if you have rep less than 50
                    throw new Error(`Insufficient reputation to create new tags`);

                } else {
                    const newTag = new Tag({name: tagName});
                    await newTag.save();

                    // add new tag to user's list of tagsCreated
                    await User.findOneAndUpdate(
                        { _id: user._id }, 
                        { $push: { tagsCreated: newTag._id } }
                    );

                    return newTag._id;
                }
            }
        }))

        let newQuestion = new Question({
            title: req.body.title,
            summary: req.body.summary,
            text: req.body.text,
            asked_by: user.userName,
            tags: tagIds
            // For tags need a way to go through all tag names and see what the id is or make one and add it here
        })
        let savedQuestion = await newQuestion.save();
        res.send(savedQuestion)
        
    } catch (error) {
        res.status(400).send({message: "Error creating new question", error: error.message});
    }
});

app.put('/questions/:qID/views', async function (req, res) {
    try {
        const question = await Question.findById(req.params.qID).populate("tags").populate("answers").populate("comments");
        if (!question) {
            // If the question doesn't exist, return a 404 error
            return res.status(404).send({message: "Question not found"});
        }
        question.views += 1;
        const updatedQuestion = await question.save();
        res.send(updatedQuestion);
    } catch (error) {
        res.status(404).send("Question not found");
    }
});

app.put('/questions/:qID/votes', isAuthenticated, async function (req, res) {
    //find the user
    const userId = jwt.decode(req.cookies.token).userId;
    const user = await User.findById(userId);
    try {
        const question = await Question.findById(req.params.qID);
        if (!question) {
            // If the question doesn't exist, return a 404 error
            return res.status(404).send({message: "Question not found"});
        }
        if (user.reputation < 50) {
            throw new Error(`Insufficient reputation to vote`);
        } else {
            // find if it is upvote or downvote
            let type = req.body.type;
            // find user
            let username = question.asked_by;
            const user = await User.findOne({userName: username});
            if (!user) {
                // If the user doesn't exist, throw error
                throw new Error(`User not found`);
            }
            if (type){
                user.reputation += 5;
            } else {
                user.reputation -= 10;
            }
            await user.save();
            question.votes = req.body.updatedVote;
            // push userID to voteBy
            question.votedBy.push(userId);
            // save the updated question document
            const updatedQuestion = await question.save();
            res.send(updatedQuestion);
        }
    } catch (error) {
        res.status(400).send({message: "Error voting on question", error: error.message});
    }
});

app.get('/questions/:qID/votes/status', isAuthenticated, async function (req, res) {
    const userId = jwt.decode(req.cookies.token).userId;
    try {
        const question = await Question.findById(req.params.qID);
        if (!question) {
            // If the question doesn't exist, return a 404 error
            return res.status(404).send({message: "Question not found"});
        }
        // check if user is in list of votedBy
        const hasVoted = question.votedBy.includes(userId);

        res.send({ hasVoted });
    } catch (error) {
        res.status(400).send({message: "Error checking if user voted on question", error: error.message});
    }
});

app.post('/questions/:qID/comment', isAuthenticated, async function (req, res) {
    const userId = jwt.decode(req.cookies.token).userId;
    const user = await User.findById(userId);
    try {
        if (user.reputation < 50) {
            throw new Error(`Insufficient reputation to comment`);
        }
        if (req.body.text.length > 140) {
            throw new Error(`Comment must be 140 characters or less`);
        }
        // create new comment
        let newcomment = new Comment({
            text: req.body.text,
            create_by: userId
        })
        let savedComment = await newcomment.save();

        // find the question by ID
        const question = await Question.findById(req.params.qID).populate("tags").populate("answers")
            .populate({
                path: 'comments',
                populate: { path: 'create_by', select: 'userName' }
            });

        if (!question) {
            // if the question doesn't exist, return a 404 error
            return res.status(404).send({message: "Question not found"});
        }

        // add the new comment's ID to the question's comment array
        question.comments.push(savedComment._id);
        // save the updated question document
        const updatedQuestion = await question.save();
        await updatedQuestion.populate({
            path: 'comments',
            populate: { path: 'create_by', select: 'userName' }
        });
        res.send(updatedQuestion);
    } catch (error) {
        console.error(error);
        res.status(400).send({message: "Error creating new comment for question", error: error.message});
    }
});

app.get('/questions/:qID/comments', async function (req, res) {
    try {
        // find the question by ID
        const question = await Question.findById(req.params.qID).populate("tags").populate("answers")
            .populate({
                path: 'comments',
                populate: { path: 'create_by', select: 'userName' }
            });

        if (!question) {
            // if the question doesn't exist, return a 404 error
            return res.status(404).send({message: "Question not found"});
        }
        // got answer id list
        comments_ids = question.comments;
        // for each answer id in comments, add the entire answer object into array
        const commentList = await Promise.all(
            comments_ids.map(async (id) => {
                return await Comment.findById(id).populate("create_by").populate("votedBy");
            })
        );
        res.send(commentList);
    } catch (error) {
        console.error(error);
        res.status(400).send({message: "Error getting comments for question", error: error.message});
    }
});

app.get('/answers/:qID', async function (req, res) {
    try {
        // got the question
        const question = await Question.findById(req.params.qID).populate("answers");
        if (!question) {
            // If the question doesn't exist, return a 404 error
            return res.status(404).send({message: "Question not found"});
        }
        // got answer id list
        ans = question.answers;
        // for each answer id in answers, add the entire answer object into array
        const answerList = await Promise.all(
            ans.map(async (id) => {
                return await Answer.findById(id);
            })
        );
        res.send(answerList);
    } catch (error) {
        res.status(404).send("Error finding answers");
    }
});

app.post('/answers/:qID', isAuthenticated, async function (req, res) {
    //find the user
    const userId = jwt.decode(req.cookies.token).userId;
    const user = await User.findById(userId);

    try {
        // create new answer with req.body parameters
        let newAnswer = new Answer({
            text: req.body.text,
            ans_by: user.userName,
        })
        let savedAnswer = await newAnswer.save();
        // find the question by ID
        const question = await Question.findById(req.params.qID).populate("tags").populate("answers");
        if (!question) {
            // if the question doesn't exist, return a 404 error
            return res.status(404).send({message: "Question not found"});
        }
        // add the new answer's ID to the question's answers array
        question.answers.push(savedAnswer._id);
        // save the updated question document
        const updatedQuestion = await question.save();
        res.send(updatedQuestion)
    } catch (error) {
        console.error(error);
        res.status(400).send({message: "Error creating new answer", error: error.message});
    }
});

app.put('/answers/:aID/votes', isAuthenticated, async function (req, res) {
    const userId = jwt.decode(req.cookies.token).userId;
    const user = await User.findById(userId);
    try {
        const answer = await Answer.findById(req.params.aID);
        if (!answer) {
            // If the question doesn't exist, return a 404 error
            return res.status(404).send({message: "Answer not found"});
        }
        if (user.reputation < 50) {
            throw new Error(`Insufficient reputation to vote`);
        } else {
            // find if it is upvote or downvote
            let type = req.body.type;
            // find user
            let username = answer.ans_by;
            const user = await User.findOne({userName: username});
            if (!user) {
                // If the user doesn't exist, throw error
                throw new Error(`User not found`);
            }
            if (type){
                user.reputation += 5;
            } else {
                user.reputation -= 10;
            }
            await user.save();

            answer.votes = req.body.updatedVote;
            answer.votedBy.push(userId);
            const updatedAnswer = await answer.save();
            res.send(updatedAnswer);
        }
    } catch (error) {
        res.status(400).send({message: "Error voting on answer", error: error.message});
    }
});

app.get('/answers/:aID/votes/status', isAuthenticated, async function (req, res) {
    const userId = jwt.decode(req.cookies.token).userId;
    try {
        const answer = await Answer.findById(req.params.aID);
        if (!answer) {
            // If the question doesn't exist, return a 404 error
            return res.status(404).send({message: "Answer not found"});
        }
        // check if user is in list of votedBy
        const hasVoted = answer.votedBy.includes(userId);

        res.send({ hasVoted });
    } catch (error) {
        res.status(400).send({message: "Error checking if user voted on answer", error: error.message});
    }
});

app.post('/answers/:aID/comment', isAuthenticated, async function (req, res) {
    const userId = jwt.decode(req.cookies.token).userId;
    const user = await User.findById(userId);
    try {
        if (user.reputation < 50) {
            throw new Error(`Insufficient reputation to comment`);
        }
        if (req.body.text.length > 140) {
            throw new Error(`Comment must be 140 characters or less`);
        }
        // create new comment
        let newcomment = new Comment({
            text: req.body.text,
            create_by: userId
        })
        let savedComment = await newcomment.save();

        // find the answer by ID
        const answer = await Answer.findById(req.params.aID)
            .populate({
                path: 'comments',
                populate: { path: 'create_by', select: 'userName' }
            });

        if (!answer) {
            // if the answer doesn't exist, return a 404 error
            return res.status(404).send({message: "Answer not found"});
        }

        // add the new comment's ID to the answer's comment array
        answer.comments.push(savedComment._id);
        // save the updated answer document
        const updatedAnswer = await answer.save();
        await updatedAnswer.populate({
            path: 'comments',
            populate: { path: 'create_by', select: 'userName' }
        });
        res.send(updatedAnswer);
    } catch (error) {
        console.error(error);
        res.status(400).send({message: "Error creating new comment for answer", error: error.message});
    }
});

app.get('/answers/:aID/comments', async function (req, res) {
    try {
        // find the answer by ID
        const answer = await Answer.findById(req.params.aID)
            .populate({
                path: 'comments',
                populate: { path: 'create_by', select: 'userName' }
            });

        if (!answer) {
            // if the answer doesn't exist, return a 404 error
            return res.status(404).send({message: "Answer not found"});
        }
        // got comment id list
        comments_ids = answer.comments;
        // for each comment id in comments, add the entire answer object into array
        const commentList = await Promise.all(
            comments_ids.map(async (id) => {
                return await Comment.findById(id).populate("create_by").populate("votedBy");
            })
        );
        res.send(commentList);
    } catch (error) {
        console.error(error);
        res.status(400).send({message: "Error getting comments for answer", error: error.message});
    }
});

app.get("/tags", async function (req, res) {
    const tags = await Tag.find();
    res.send(tags);
});

app.post("/register", async function(req, res) {
    const accountInfo = req.body;

    // Hash Password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(accountInfo.password, salt);

    accountInfo.password = passwordHash;

    const newUser = new User(accountInfo);
    try{
        await newUser.save();
        res.status(200).send("Successfully added new user");
    }
    catch (error) {
        return res.status(400).send("Error creating new user");
    }
    
});

app.post("/login", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({email: email})

    // No user with this email
    if (!user) {
        return res.status(401).json({errorType: "email"}).send();
    }
    const passwordCorrect = await bcrypt.compare(password, user.password)
    if (!passwordCorrect) {
        return res.status(401).json({errorType: "password"}).send();
    }

    const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY);
  
    await res.cookie("token", token, {httpOnly: true, secure: true, sameSite: "none"})
    .status(200).json({
        success: true,
        user: {
        email: user.email,
        isAdmin: user.isAdmin ? true : false
        }})
        .send();
});

app.get("/logout", isAuthenticated, function(req, res) {
    try {
        res.clearCookie("token");
        res.status(200).send("Successfully Logged Out")
    }
    catch (err) {
        res.status(400).send("Error logging out");
    }


});


app.get("/profile", isAuthenticated, async function(req, res) {
    const userId = jwt.decode(req.cookies.token).userId;
    const user = await User.findById(userId).populate("tagsCreated");
    res.status(200).send(user)
});

app.get("/users", async function(req, res) {
    try {
        const users = await User.find();
        res.status(200).send(users);
    }
    catch (err) {
        res.status(500).send(err);
    }
});

app.post("/deleteQuestion/:qid", async function(req, res) {
    try {
        const qid = req.params.qid;
        try {
            await deleteQuestion(qid);
        } catch (err) {
            console.log("error deleting question: ", err);
            res.status(400).send("error deleting question: ", err);
        }
        deleteUnusedTags();

        res.status(200).send("Deleted Question Successfully");
    }  
    catch (err) {
        console.error(err)
        res.status(500).send(err);
    }
});

app.post("/deleteUser/:uid", async function(req, res) {
    try {

        const uid = req.params.uid;
        const userQuestions = await getUserQuestions(uid);
        const userAnswers = await getUserAnswers(uid);
        const userComments = await getUserComments(uid);
        //delete their comments
        userComments.forEach(async (c) => await deleteComment(c))
        //delete their questions
        userQuestions.forEach(async (q) => await deleteQuestion(q))
        //delete their answers
        userAnswers.forEach(async (a) => await deleteAnswer(a))

        await User.deleteOne({_id: uid});
    }
    catch (err) {
        console.log("error: ", err)
    }
});

app.post("/updateQuestion/:qid", async function(req, res) {
    try {
        const qid = req.params.qid;
        const newQuestion = req.body;
        const oldQuestion = await Question.findById(qid);
        const user = await User.findOne({userName: oldQuestion.asked_by});

        //dealing with tags
        const tagNames = newQuestion.tagNames.map((tagName) => tagName.toLowerCase());
        uniqueTagNames = tagNames.filter(function(elem, pos) {
            return tagNames.indexOf(elem) == pos;
        })
        const tagIds = await Promise.all(uniqueTagNames.map(async (tagName) => {
            const tag = await Tag.findOne({name: tagName});
            // tag already exists
            if (tag) {
                return tag._id;
            }
            // make a new tag if user has rep more than 50 
            else {
                if (user.reputation < 50) {
                    // send the error from server because you cant create a new tag if you have rep less than 50
                    throw new Error(`Insufficient reputation to create new tags`);

                } 
                else {
                    const newTag = new Tag({name: tagName});
                    await newTag.save();

                    // add new tag to user's list of tagsCreated
                    await User.findOneAndUpdate(
                        { _id: user._id }, 
                        { $push: { tagsCreated: newTag._id } }
                    );

                    return newTag._id;
                }
            }
        }))



        await Question.updateOne({_id: qid}, {
            $set: {
                title: newQuestion.title,
                summary: newQuestion.summary,
                text: newQuestion.text,
                tags: tagIds
            }
        });
        
        deleteUnusedTags();

        res.send("Successfully updated question")
        
    }
    catch (error) {
        res.status(400).send({message: "Error creating new question", error: error.message});
    }
})

app.post("/deleteTag/:tid", async (req, res) => {
    const tid = req.params.tid;
    let beingUsed = await tagBeingUsed(tid);
    if (!beingUsed) {
        try {
            const tag = await Tag.deleteOne({_id: tid});
            res.status(200).send(tag);

        } catch(err) {
            console.log("error deleting tag: ", err);
            res.status(400).send("error deleting tag");
        }
    } else {
        res.status(400).send("error: tag being used");
    }
})

app.get("/user/:uid", async (req, res) => {
    const uid = req.params.uid;
    try {
        const user = await User.findById(uid).populate("tagsCreated");
        res.status(200).send(user);
    } 
    catch(err) {
        console.log("error fetching user: ", err);
        res.status(400).send("error fetching user");
    }
})

app.post("/updateAnswer/:aid", async (req, res) => {
    const newAnswerText = req.body.text;
    const aid = req.params.aid;
    try {
        const answerToBeUpdated = await Answer.findOneAndUpdate({_id: aid}, {$set : {text: newAnswerText}});
        res.status(200).send(answerToBeUpdated);

    } catch (err) {
        console.log("error updating answer: ", err);
        res.status(400).send("error updating answer");
    }
    }

)

app.post("/deleteAnswer/:aid", async (req, res) => {
    const aid = req.params.aid;
    try {
        await Answer.deleteOne({_id: aid})
        res.status(200).send("Successfully deleted answer");

    } catch (err) {
        console.log("error deleting answer: ", err);
        res.status(400).send("error deleting answer");
    }
})

app.post("/updateTag/:tid", async (req, res) => {
    const tid = req.params.tid;
    const newName = req.body.newName;
    let beingUsed = await tagBeingUsed(tid);
    if (!beingUsed) {
        try {
            await Tag.findOneAndUpdate({_id: tid}, {$set : {name: newName}})
            res.status(200).send("Successfully edited tag");
    
        } catch (err) {
            console.log("error editing tag: ", err);
            res.status(400).send("error editing tag");
        }
    } 
    else {
        res.status(400).send("Error: tag being used")
    }

})

app.get("/comments/:cID/votes/status", isAuthenticated, async (req, res) => {
    const userId = jwt.decode(req.cookies.token).userId;
    try {
        const comment = await Comment.findById(req.params.cID);
        if (!comment) {
            // If the question doesn't exist, return a 404 error
            return res.status(404).send({message: "Comment not found"});
        }
        // check if user is in list of votedBy
        const hasVoted = comment.votedBy.includes(userId);

        res.send({ hasVoted });
    } catch (error) {
        res.status(400).send({message: "Error checking if user voted on comment", error: error.message});
    }
});

app.put('/comments/:cID/votes', isAuthenticated, async function (req, res) {
    //find the user
    const userId = jwt.decode(req.cookies.token).userId;
    try {
        const comment = await Comment.findById(req.params.cID);
        if (!comment) {
            // If the question doesn't exist, return a 404 error
            return res.status(404).send({message: "Comment not found"});
        }
        comment.votes = req.body.updatedVote;
        comment.votedBy.push(userId);
        // save the updated question document
        const updatedComment = await comment.save();
        res.send(updatedComment);
    } catch (error) {
        res.status(400).send({message: "Error voting on comment", error: error.message});
    }
});

// When user presses CTRL-C
process.on("SIGINT", () => {
    db.close();
    console.log("Server closed. Database instance disconnected");
    process.exit(0);
});

// Run server on port 8000
app.listen(8000, () => {
    console.log("server running on port 8000!");
});