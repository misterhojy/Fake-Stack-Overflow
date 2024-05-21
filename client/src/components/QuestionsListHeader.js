export default function QuestionsListHeader(props) {
    
    const headerText = props.headerText;
    const questionsList = props.questionsList;
    const changeSorting = props.changeSorting;
    const changeContent = props.changeContent;


    return (
        <div id = "all-questions-div"> 
        <div id = "first-row">
            <p id="all-questions-text"> {headerText} </p>
            <button className="blue-button" id="ask-question-button" onClick={() => {changeContent("questionForm")}}> Ask Question</button>

        </div>
        <div id = "second-row"> 
            <p id="question-count"> {questionsList.length} {questionsList.length === 1 ? "question" : "questions"}</p>
            <div id = "button-group">
                <button className="button-group-class" id="newest-button" onClick={() => {changeSorting("newest"); changeContent("homePage")}}>Newest</button>
                <button className="button-group-class" id="active-button" onClick={() => {changeSorting("active"); changeContent("homePage")}}>Active</button>
                <button className="button-group-class" id="unanswered-button" onClick={() => {changeSorting("unanswered"); changeContent("homePage")}}>Unanswered</button>
            </div>
        </div>

        </div>
    )
}