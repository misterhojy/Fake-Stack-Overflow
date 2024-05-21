// import QuestionsListHeader from "./QuestionsListHeader";
import TagBlock from "./TagBlock";
import QuestionCard from "./QuestionCard";

import { useState, useEffect } from "react";
import axios from "axios";

export default function TagsPage(props) {
    
    const selectedTag = props.selectedTag;
    const changeSelectedTag = props.changeSelectedTag;
    const changeContent = props.changeContent;
    const changeMenuItem = props.changeMenuItem;
    const changeSelectedQuest = props.changeSelectedQuest;
    const loggedIn = props.loggedIn;

    const [questionsList, setQuestionsList] = useState([]);
    const [tagsList, setTagsList] = useState([]);

    useEffect(() => {
        const getData = async () => {
            const questions = await axios.get("http://localhost:8000/questions");
            setQuestionsList(questions.data)
            const tags = await axios.get("http://localhost:8000/tags");
            setTagsList(tags.data);
        };
        getData();
    }, []);

    const getQuestionsWithTag = (tag) => {
        const questionsWithTag = questionsList.filter((question) => {
          const tags = question.tags.map((tag) => tag.name);
          return tags.includes(tag.name)
          
        });
        return questionsWithTag;
      }
    


    const taggedQuestions = getQuestionsWithTag(selectedTag);
    taggedQuestions.sort((q1, q2) => {
        if (q1.ask_date_time < q2.ask_date_time) {
            return 1;
        }
        else if (q1.ask_date_time > q2.ask_date_time) {
            return -1;
        }
        return 0;
    })


    const questionCards = taggedQuestions.map((question, index) => <QuestionCard key = {index} question = {question} changeMenuItem = {changeMenuItem} changeSelectedQuest = {changeSelectedQuest} changeContent={changeContent}> </QuestionCard>);

    const tagCards = tagsList.map((tag, index) => <TagBlock key = {index} tag = {tag} changeSelectedTag = {changeSelectedTag} questionsList = {questionsList}> </TagBlock>);
    
    if (selectedTag !== "none") {
        return (
            <div id="content">
                <div>
                    {/* <QuestionsListHeader headerText = {"Questions tagged with " + selectedTag.name} questionsList = {taggedQuestions} changeSorting = {changeSorting} changeContent = {changeContent}> </QuestionsListHeader> */}
                     <div id = "all-questions-div"> 
                        <div id = "first-row">
                            <p id="all-questions-text"> {"Questions tagged with " + selectedTag.name} </p>
                            {loggedIn && <button className="blue-button" id="ask-question-button" onClick={() => {changeContent("questionForm")}}> Ask Question</button>}

                        </div>
                        <div id = "second-row"> 
                            <p id="question-count"> {taggedQuestions.length} {taggedQuestions.length === 1 ? "question" : "questions"}</p>
                            <div id = "button-group">
                                {/* <button className="button-group-class" id="newest-button" onClick={() => {changeSorting("newest"); changeContent("homePage")}}>Newest</button>
                                <button className="button-group-class" id="active-button" onClick={() => {changeSorting("active"); changeContent("homePage")}}>Active</button>
                                <button className="button-group-class" id="unanswered-button" onClick={() => {changeSorting("unanswered"); changeContent("homePage")}}>Unanswered</button> */}
                            </div>
                        </div>
                </div>
                </div>
                <div id = "questions-list">
                    {questionCards}
                </div>
            </div>
        )
    }

    return (
        <div id="content">
            <div id="tags-header">
                <p> {tagsList.length + " Tags"}</p>
                <p> All tags </p>
                {loggedIn && <button className="blue-button" onClick={() => {changeContent("questionForm")}}> Ask Question </button>} 
            </div>

            <div id="tags-list-container">
                {tagCards}
            </div>

        </div>
    )
}