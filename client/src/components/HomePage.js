import QuestionCard from "./QuestionCard.js"
// import QuestionsListHeader from "./QuestionsListHeader.js";
import axios from "axios";
import { useState, useEffect } from "react";
export default function HomePage(props) {

    const changeContent = props.changeContent;
    const changeMenuItem = props.changeMenuItem;
    const changeSelectedQuest = props.changeSelectedQuest;

    const [questionsList, setQuestionsList] = useState([]);
    const [sorting, setSorting] = useState("newest");
    const [page, setPage] = useState(0)

    useEffect(() => {
        let getQuestions = async () => {
            const list = await axios.get("http://localhost:8000/questions", {withCredentials: true});
            setQuestionsList(list.data);
        };
        getQuestions();
    }, []);

    const nextOnClick = () => {
        if (page >= Math.ceil(questionsList.length / 5)-1) {
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
    

    const sortByNewestFunction = (q1, q2) => {
        if (q1['ask_date_time'] < q2['ask_date_time']) {
          return 1;
        }
        else if (q1['ask_date_time'] > q2['ask_date_time']) {
          return -1;
        }
        else {
          return 0;
        }
      }
    
    const sortByActiveFunction = (q1, q2) => {

        if (q1.answers.length === 0) {
            return 1;
        }
        if (q2.answers.length === 0) {
            return -1;
        }
        const q1Sorted = q1.answers.map((a) => new Date(a.ans_date_time)).sort((a1, a2) => {
            return a2 - a1;
        });
        const q2Sorted = q2.answers.map((a) => new Date(a.ans_date_time)).sort((a1, a2) => {
            return a2 - a1;
        });
        
        return q2Sorted[0] - q1Sorted[0];
    }

    let sortedList;
    switch (sorting) {
        case "newest":
            sortedList = questionsList.sort(sortByNewestFunction);
            break;
        case "active":
            sortedList = questionsList.sort(sortByActiveFunction);
            break;
        case "unanswered":
            sortedList = questionsList.filter((question) => question.answers.length === 0);
            break;
        default:
            sortedList = questionsList; 
            break;
    }


    const start = page * 5;
    const end = start + 5;
    sortedList = sortedList.slice(start, end);

    //make all the questions
    const questionCards = sortedList.map((question, index) => <QuestionCard key={index} question={question} changeContent = {changeContent} changeMenuItem = {changeMenuItem} changeSelectedQuest = {changeSelectedQuest}> </QuestionCard>);

    return (
        <div id = "content"> 
            <div id = "all-questions-div"> 
                <div id = "first-row">
                    <p id="all-questions-text"> {"All Questions"} </p>
                    { props.loggedIn && <button className="blue-button" id="ask-question-button" onClick={() => {changeContent("questionForm")}}> Ask Question</button>}

                </div>
                <div id = "second-row"> 
                    <p id="question-count"> {questionsList.length} {questionsList.length === 1 ? "question" : "questions"}</p>
                    <div id = "button-group">
                        <button className="button-group-class" id="newest-button" onClick={() => {setSorting("newest"); changeContent("homePage")}}>Newest</button>
                        <button className="button-group-class" id="active-button" onClick={() => {setSorting("active"); changeContent("homePage")}}>Active</button>
                        <button className="button-group-class" id="unanswered-button" onClick={() => {setSorting("unanswered"); changeContent("homePage")}}>Unanswered</button>
                    </div>
                </div>
            </div>
            <div id="questions-list"> 
                {questionCards}
            </div>

            <div className="pagination-div">
                <button onClick={prevOnClick}> prev </button>
                <p> Page {page}</p>
                <button onClick={nextOnClick}> next </button>
            </div>

        </div>
    )
}