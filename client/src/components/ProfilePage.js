import { useState, useEffect } from "react"
import axios from "axios";
import TagBlock from "./TagBlock";
import QuestionCard from "./QuestionCard";

export function QuestionTitle(props) {


    const handleAskedClick = () => {
        props.changeContent("editQuestionForm");
        props.changeCurrentQuestion(props.question);
    }

    const handleAnsweredClick = () => {
        props.changeContent("profileAnswerPage");
        props.changeSelectedQuest(props.question);
    }



    return <button style={{borderStyle: "dashed", display: "block", fontSize: "22px", textAlign: "left", width: "100%"}}className="profile-question-title" onClick={props.type === "answered" ? handleAnsweredClick : handleAskedClick}> {props.question.title} </button>
}

export default function ProfilePage(props) {

    const givenUser = props.user;
    const isAdmin = props.isAdmin;
    const changeCurrentUser = props.changeCurrentUser;

    const [user, setUser] = useState(null);
    const [allQuestions, setAllQuestions] = useState([]);
    const [menuItem, setMenuItem] = useState("questionsAsked");

    useEffect(() => {

        const getData = async () => {
            try {
                // If no user id is provided, make request to server to get it
                if (!givenUser) {
                    const userProfile = await axios.get("http://localhost:8000/profile", {withCredentials: true});
                    setUser(userProfile.data);

                }
                //If it was provided
                else {
                    let userProf = await axios.get("http://localhost:8000/user/" + givenUser._id, {withCredentials: true});
                    setUser(userProf.data);
                }
                const questions = await axios.get("http://localhost:8000/questions", {withCredentials: true});
                setAllQuestions(questions.data);

            } catch(err) {
                console.log("err: ", err);
            }
        }
        getData();

    }, [givenUser]);

    const questionsAskedOnClick = () => {
        setMenuItem("questionsAsked");
    }
    const questionsAnsweredOnClick = () => {
        setMenuItem("questionsAnswered");
        changeCurrentUser(user)
    }
    const tagsOnClick = () => {
        setMenuItem("tags");
    }

    let questionsAskedBackgroundColor = {backgroundColor: "white"};
    let questionsAnsweredBackgroundColor = {backgroundColor: "white"};
    let tagsBackgroundColor = {backgroundColor: "white"};
    if (menuItem === "questionsAsked") {
        questionsAskedBackgroundColor = {backgroundColor: "#c9c9c9"};
    }
    else if (menuItem === "tags") {
        tagsBackgroundColor = {backgroundColor: "#c9c9c9"};
    }
    else if (menuItem === "questionsAnswered") {
        questionsAnsweredBackgroundColor = {backgroundColor: "#c9c9c9"}
    }

    const totalTime = () => {
        const ms = Date.now() - Date.parse(user.createdAt);
        const seconds = Math.round(ms / 1000);
        const mins = Math.round(ms / (1000 * 60));
        const hours = Math.round(mins / 60);
        const days = Math.round(hours / 24);
        const years = Math.round(days / 365);

        if (mins < 1) {
            return seconds + " seconds";
        }

        else if (hours < 1) {
            return mins + " mins";
        }
        else if (days < 1) {
            return hours + " hours";
        }
        else if (years < 1) {
            return days + " days";
        }
        return years + " years";
    }

    let questionsAsked = allQuestions.filter((question) => {
        return question.asked_by === user.userName;
    })

    let questionsAnswered = allQuestions.filter((question) => {
        return question.answers.some((answer) => answer.ans_by === user.userName)
    })


    let questionsList = [];
    let tagsList = [];
    let errorText = "";
    let type;
    switch (menuItem) {
        case "questionsAsked":
            questionsList = questionsAsked;
            type = "asked";
            if (questionsAsked.length === 0) {
                errorText = "You have not asked any questions"
            } else {errorText = ""}
            break;
        case "questionsAnswered":
            questionsList = questionsAnswered;
            type = "answered"
            if (questionsAnswered.length === 0) {
                errorText = "You have not answered any questions"
            } else {errorText = ""}
            break;
        case "tags":
            tagsList = user.tagsCreated ? user.tagsCreated : [];
            if (tagsList.length === 0) {
                errorText = "You have not created any tags"
            } else {errorText = ""}
            break;
        default:
            questionsList = questionsAsked;
            break;
    }
    questionsList = questionsList.sort((q1, q2) => {
        if (q1['ask_date_time'] < q2['ask_date_time']) {
            return 1;
          }
          else if (q1['ask_date_time'] > q2['ask_date_time']) {
            return -1;
          }
          else {
            return 0;
          }
    })

    let questionTitles;
    if (type === "asked") {
        questionTitles = questionsList.map((question, index) => <QuestionTitle key = {index} type = {type} question = {question} changeContent = {props.changeContent} changeCurrentQuestion = {props.changeCurrentQuestion} changeSelectedQuest = {props.changeSelectedQuest}> </QuestionTitle>);
    }
    else {

        questionTitles = questionsList.map((question, index) => <QuestionCard key={index} fromProfilePage = {true} question={question} changeContent = {props.changeContent} changeMenuItem = {props.changeMenuItem} changeSelectedQuest = {props.changeSelectedQuest}> </QuestionCard>)
    }
    let tagBoxes = tagsList.map((tag, index) => <TagBlock key = {index} tag ={tag} questionsList = {allQuestions} profilePage = {true} changeContent = {props.changeContent} changeSelectedTag = {props.changeSelectedTag}> </TagBlock>)


    return (
        <div id= {isAdmin ? "" : "content"}>
            <div className="user-info-div"> 

            <h1 className="profile-header"> {user ? user.userName + "'s": ''}  Profile </h1>
            <p className="profile-text"> {"Member for " + (user ? totalTime() : '')} </p>
            <p className="profile-text"> {"Reputation: " + (user ? user.reputation : '')} </p>
            
            </div>
            <div className="profile-menu">
                <button className="link-text" style={questionsAskedBackgroundColor} onClick={questionsAskedOnClick}> Questions Asked </button>
                <button className="link-text" style={questionsAnsweredBackgroundColor} onClick={questionsAnsweredOnClick}> Questions Answered </button>
                <button className="link-text" style={tagsBackgroundColor} onClick={tagsOnClick}> Tags </button>
            </div>

            <div className="profile-list">
            {questionTitles}
            {errorText}
            <div id="tags-list-container">
                {tagBoxes}
            </div>
            </div>
        </div>
    )
}