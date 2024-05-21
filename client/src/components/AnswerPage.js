import { generateMetadataString } from './QuestionCard.js';
import axios from "axios";
import { useState, useEffect } from "react";

function replaceHyper(text) {
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g;
    const replacedText = text.replace(markdownLinkRegex, (match, text, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      });
    
      return replacedText;    
}

const sortByNewestFunction_comments = (a1, a2) => {
    if (a1.create_date_time < a2.create_date_time) {
        return 1;
    }
    else if (a1.create_date_time > a2.create_date_time) {
        return -1;
    }
    return 0;
}

function CommentCard(props) {
    const comment = props.comment;
    const loggedIn = props.loggedIn;

    const [votes, setVotes] = useState(comment.votes);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        setVotes(comment.votes);
        if (loggedIn) checkIfUserHasVoted();
    }, [comment]);

    const checkIfUserHasVoted = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/comments/${comment._id}/votes/status`, { withCredentials: true });
            setHasVoted(response.data.hasVoted);
        } catch (error) {
            console.error('Error checking vote status:', error);
        }
    };

    const upvote = async () => {
        if (hasVoted) {
            window.alert("Already Voted");
            return;
        }

        const updatedVote = votes + 1;
        setVotes(updatedVote);
        try {
            await axios.put(`http://localhost:8000/comments/${comment._id}/votes`, {updatedVote: updatedVote}, { withCredentials: true });
            setHasVoted(true);
    
        } catch (error) {
            console.log(error);
            setVotes(votes);
        }
    };


    return (
        <div id="comment-wrapper">
            <div className ="comment-vote">
                {loggedIn && <button className="vote-button upvote" onClick={upvote}>▲</button>}
                <p className="vote-count">{votes}</p>
            </div>
            <div id="comment-text">
                <p>{comment.text}</p>
            </div>
            <div id="comment-name">
                <p>{comment.create_by.userName}</p>
            </div>
        </div>
    )
}

function AnswerCard(props) {
    const answer = props.answer;
    const user = props.currentUser;
    const loggedIn = props.loggedIn;

    const modifyAnswer = () => {
        props.changeCurrentAnswer(answer);
        props.changeContent("editAnswerForm");
    }

    const deleteAnswer = () => {
        axios.post(`http://localhost:8000/deleteAnswer/${answer._id}`)
            .then((response) => {
                props.changeCurrentAnswer(answer);
                props.changeContent("homePage");
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const [commentList, setCommentList] = useState([]);
    const [page, setPage] = useState(0)

    useEffect(() => {
    let getComments = async () => {
        try {
            const list = await axios.get(`http://localhost:8000/answers/${answer._id}/comments`);
            setCommentList(list.data);
        } catch (error) {
            console.error('Error getting comments:', error);
        }
    };
    getComments();
    }, [answer._id]);

    const nextOnClick = () => {
        if (page >= Math.ceil(commentList.length / 3)-1) {
            setPage(0);
            return;
        }
        setPage(prevState => prevState + 1);
    }
    const prevOnClick = () => {
        if (page > 0) {
            setPage(prevState => prevState - 1)
        }
    }

    let sortedComments = commentList.sort(sortByNewestFunction_comments);

    const start = page * 3;
    const end = start + 3;
    sortedComments = sortedComments.slice(start, end);

    const comments = sortedComments.map((comment, index) => <CommentCard key = {index} comment = {comment} loggedIn={loggedIn}> </CommentCard>);


    const [votes, setVotes] = useState(answer.votes);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        setVotes(answer.votes);
        if (loggedIn) checkIfUserHasVoted();
    }, [answer]);

    const checkIfUserHasVoted = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/answers/${answer._id}/votes/status`, { withCredentials: true });
            setHasVoted(response.data.hasVoted);
        } catch (error) {
            console.error('Error checking vote status:', error);
        }
    };

    const upvote = async () => {
        if (hasVoted) {
            window.alert("Already Voted");
            return;
        }

        const updatedVote = votes + 1;
        const newVotes = {
            updatedVote: updatedVote,
            type: 1
        };
        setVotes(updatedVote);
        await updateVotesOnServer(newVotes);
    };

    const downvote = async () => {
        if (hasVoted) {
            window.alert("Already Voted");
            return;
        }

        const updatedVote = votes - 1;
        const newVotes = {
            updatedVote: updatedVote,
            type: 0
        };
        setVotes(updatedVote);
        await updateVotesOnServer(newVotes);
    };

  const updateVotesOnServer = async (newVotes) => {
    try {
        await axios.put(`http://localhost:8000/answers/${answer._id}/votes`, newVotes, { withCredentials: true });
        setHasVoted(true);

    } catch (error) {
        if (error.response) {
            const error_type = error.response.data.error;

            if (error_type && error_type.includes("Insufficient reputation to vote")) {
                // alert window that pops up saying you can't vote
                window.alert(error_type);
            } else if (error_type && error_type.includes("User not found")) {
                window.alert(error_type);
            }
        } else {
            console.log(error);
        }
        setVotes(votes);
    }
  };

    const onKeyDown = async (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const text = event.target.value;
            console.log(text);

            await axios.post(`http://localhost:8000/answers/${answer._id}/comment`, { text: text }, { withCredentials: true })
                .then(function (response) {
                    //change selected question to this one to be updated
                    setCommentList(response.data.comments);
                })
                .catch(function (error) {
                    if (error.response) {
                        const error_type = error.response.data.error;
            
                        if (error_type && error_type.includes("Insufficient reputation to comment")) {
                            // alert window that pops up saying you can't vote
                            window.alert(error_type);
                        } 
                        if (error_type && error_type.includes("Comment must be 140 characters or less")) {
                            // alert window that pops up saying you can't vote
                            window.alert(error_type);
                        } 
                    } else {
                        console.log(error);
                    }
                });

            event.target.value = '';
        }
    };

    const text = replaceHyper(answer.text);
    return (
        <div className="answers-div">
            {loggedIn && <div className="vote">
                <button className="vote-button upvote" onClick={upvote}>▲</button>
                <p className="vote-count">{votes}</p>
                <button className="vote-button downvote" onClick={downvote}>▼</button>
            </div>}
            <div className="answer-text">
                <p dangerouslySetInnerHTML={{ __html: text }} />
            </div>
            {user && answer.ans_by === user.userName && <div id="i23dk">
                    <button onClick={modifyAnswer}> modify answer </button>
                    <button onClick={deleteAnswer}> delete answer </button>
                </div>}
            <div className="answer-meta">
                <p>
                    <span style={{color: "green"}}>{answer.ans_by}</span>
                    <br />
                    {"answered "} {generateMetadataString(answer.ans_date_time)}
                </p>
                <p id="num-answers">{"votes: "}{votes}</p>
            </div>
            <div id='comments'>
                <div id="comments-section">
                {comments}
                </div>
                <div id="comment-buttons">
                    {loggedIn &&<input type="text" placeholder="New Comment" name="comment" id="comment-input" onKeyDown={onKeyDown}></input>}
                    <button onClick={prevOnClick}> prev </button>
                    <button onClick={nextOnClick}> next </button>
                </div>
            </div>
        </div>
    )
}

function AnswerListHeader(props) {    
    const selectedQuest = props.selectedQuest;
    const changeContent = props.changeContent;
    const changeSelectedQuest = props.changeSelectedQuest
    const loggedIn = props.loggedIn;
    console.log("OLD ", selectedQuest);
    // if you voted once you cant keep voting

    const [votes, setVotes] = useState(selectedQuest.votes);
    const [hasVoted, setHasVoted] = useState(false);

    const [commentList, setCommentList] = useState([]);
    const [page, setPage] = useState(0)

    // send Get request to get all the comments associated with the question
    useEffect(() => {
    let getComments = async () => {
        try {
            const list = await axios.get(`http://localhost:8000/questions/${selectedQuest._id}/comments`);
            setCommentList(list.data);
        } catch (error) {
            console.error('Error getting comments:', error);
        }
    };
    getComments();
    }, [selectedQuest._id]);

    const nextOnClick = () => {
        if (page >= Math.ceil(commentList.length / 3)-1) {
            setPage(0);
            return;
        }
        setPage(prevState => prevState + 1);
    }
    const prevOnClick = () => {
        if (page > 0) {
            setPage(prevState => prevState - 1)
        }
    }

    let sortedComments = commentList.sort(sortByNewestFunction_comments);

    const start = page * 3;
    const end = start + 3;
    sortedComments = sortedComments.slice(start, end);

    const comments = sortedComments.map((comment, index) => <CommentCard key = {index} comment = {comment} loggedIn={loggedIn}> </CommentCard>);

    useEffect(() => {
        setVotes(selectedQuest.votes);
        if (loggedIn) checkIfUserHasVoted();
    }, [selectedQuest]);

    const checkIfUserHasVoted = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/questions/${selectedQuest._id}/votes/status`, { withCredentials: true });
            setHasVoted(response.data.hasVoted);
        } catch (error) {
            console.error('Error checking vote status:', error);
        }
    };

    const upvote = () => {
        if (hasVoted) {
            window.alert("Already Voted");
            return;
        }
        const updatedVote = votes + 1;
        const newVotes = {
            updatedVote: updatedVote,
            type: 1
        };
        setVotes(updatedVote);
        updateVotesOnServer(newVotes);
    };

    const downvote = () => {
        if (hasVoted) {
            window.alert("Already Voted");
            return;
        }
        const updatedVote = votes - 1;
        const newVotes = {
            updatedVote: updatedVote,
            type: 0
        };
        setVotes(updatedVote);
        updateVotesOnServer(newVotes);
    };

    const updateVotesOnServer = async (newVotes) => {
        try {
            await axios.put(`http://localhost:8000/questions/${selectedQuest._id}/votes`, newVotes, { withCredentials: true });
            setHasVoted(true);
        } catch (error) {
            if (error.response) {
                const error_type = error.response.data.error;

                if (error_type && error_type.includes("Insufficient reputation to vote")) {
                    // alert window that pops up saying you can't vote
                    window.alert(error_type);
                } else if (error_type && error_type.includes("User not found")) {
                    window.alert(error_type);
                }
            } else {
                console.log(error);
            }
            setVotes(votes);
        }
    };

    const onKeyDown = async (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const text = event.target.value;
            console.log(text);

            await axios.post(`http://localhost:8000/questions/${selectedQuest._id}/comment`, { text: text }, { withCredentials: true })
                .then(function (response) {
                    //change selected question to this one to be updated
                    setCommentList(response.data.comments);
                })
                .catch(function (error) {
                    if (error.response) {
                        const error_type = error.response.data.error;
            
                        if (error_type && error_type.includes("Insufficient reputation to comment")) {
                            // alert window that pops up saying you can't vote
                            window.alert(error_type);
                        } 
                        if (error_type && error_type.includes("Comment must be 140 characters or less")) {
                            // alert window that pops up saying you can't vote
                            window.alert(error_type);
                        } 
                    } else {
                        console.log(error);
                    }
                });

            event.target.value = '';
        }
    };
    
    const text = replaceHyper(selectedQuest.text)

    return (
        <div class="container">
            <div id="first-row">
                <p id="num-answers">{selectedQuest.answers.length} {selectedQuest.answers.length === 1 ? "answer" : "answers"}</p>
                <p id="num-answers">{selectedQuest.views} {selectedQuest.views !== 1 ? " views" : " view"}</p>
                <p id="question-title">{selectedQuest.title}</p>
                {loggedIn && <button className="blue-button" id="ask-question-button" onClick={() => {changeContent("questionForm")}}> Ask Question</button>}
            </div>
            <div id="answers-second-row">
                {loggedIn && <div className="vote">
                    <button className="vote-button upvote" onClick={upvote}>▲</button>
                    <p className="vote-count">{votes}</p>
                    <button className="vote-button downvote" onClick={downvote}>▼</button>
                </div>}
                <div id="question-text">
                    <p dangerouslySetInnerHTML={{ __html: text }} />
                </div>
                <div id="answers-meta">
                    <p>
                        <span style={{color: "red"}}>{selectedQuest.asked_by}</span>
                        <br />
                        {"asked "} {generateMetadataString(selectedQuest.ask_date_time)}
                    </p>
                    <p id="num-answers">{"votes: "}{votes}</p>
                </div>
            </div>
            <div id="answers-third-row">
                <div id='comments'>
                    <div id="comments-section">
                    {comments}
                    </div>
                    <div id="comment-buttons">
                        {loggedIn &&<input type="text" placeholder="New Comment" name="comment" id="comment-input" onKeyDown={onKeyDown}></input>}
                        <button onClick={prevOnClick}> prev </button>
                        <button onClick={nextOnClick}> next </button>
                    </div>
                </div>
                <div id="tag-list">
                    {selectedQuest.tags.map((tag, index) => (
                    <p key={index} className="tag">{tag.name}</p>
                    ))}
                </div>
            </div>
            
        </div>
    )

}

export default function AnswerPage(props) {
    const changeContent = props.changeContent;
    const selectedQuest = props.selectedQuest;
    const loggedIn = props.loggedIn;
    const currentUser = props.currentUser;
    const changeSelectedQuest = props.changeSelectedQuest

    const [answerList, setAnswerList] = useState([]);
    const [page, setPage] = useState(0)
    
    
    // send Get request to get all the answers associated with the Question
    useEffect(() => {
        let getAnswers = async () => {
            const list = await axios.get(`http://localhost:8000/answers/${selectedQuest._id}`);
            setAnswerList(list.data);
        };
        getAnswers();
    }, [selectedQuest._id]);

    const nextOnClick = () => {
        if (page >= Math.ceil(answerList.length / 5)-1) {
            setPage(0);
            return;
        }
        setPage(prevState => prevState + 1);
    }
    const prevOnClick = () => {
        if (page > 0) {
            setPage(prevState => prevState - 1)
        }
    }
    
    const sortByNewestFunction = (a1, a2) => {
        if (a1.ans_date_time < a2.ans_date_time) {
            return 1;
        }
        else if (a1.ans_date_time > a2.ans_date_time) {
            return -1;
        }
        return 0;
    }

    const profileSortFunction = (a1, a2) => {
        if (a1.ans_by === currentUser.userName && a2.ans_by === currentUser.userName) {
            return sortByNewestFunction(a1, a2);
        }
        if (a1.ans_by === currentUser.userName) {
            return -1;
        }
        if (a1.ans_date_time < a2.ans_date_time) {
            return 1;
        }
        else if (a1.ans_date_time > a2.ans_date_time) {
            return -1;
        }
        return 0;

    }
    let sortedList;
    if (props.fromProfilePage) {
        sortedList = answerList.sort(profileSortFunction);
    } else {
        sortedList = answerList.sort(sortByNewestFunction);
    }


    const start = page * 5;
    const end = start + 5;
    sortedList = sortedList.slice(start, end);

    const answerCards = sortedList.map((answer, index) => <AnswerCard key = {index} answer = {answer} changeCurrentAnswer = {props.changeCurrentAnswer} currentUser = {currentUser} changeContent = {changeContent} loggedIn = {loggedIn} changeSelectedQuest = {changeSelectedQuest}> </AnswerCard>);
    
    

    return (
        <div id="content">
            <div id="all-answers-div">
                <AnswerListHeader loggedIn={loggedIn} changeContent={changeContent} selectedQuest={selectedQuest} changeSelectedQuest = {changeSelectedQuest}> </AnswerListHeader>
                <div id="answers-list">
                    {answerCards}
                </div>
                <div id="answers-end">
                    {loggedIn && <button className="blue-button" id="ans-question-button" onClick={() => {changeContent("answerForm")}}>Answer Question</button>}
                    <div className="pagination-div">
                        <button onClick={prevOnClick}> prev </button>
                        <p> Page {page}</p>
                        <button onClick={nextOnClick}> next </button>
                    </div>
                </div>
            </div>
        </div>
    )
    
}