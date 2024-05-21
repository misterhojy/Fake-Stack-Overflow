import axios from "axios";

export const generateMetadataString = (date) => {
    let questionDate = new Date(date);

    const todaysDate = new Date();

    let diffInMilliseconds = todaysDate - questionDate;
    let diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    let diffInMinutes = Math.floor(diffInSeconds / 60);
    let diffInHours = Math.floor(diffInMinutes / 60);
    let diffInYears = Math.floor(diffInHours / (24 * 365));

    if (diffInHours < 24) {
    if (diffInMinutes === 0) {
        if (diffInSeconds !== 1){
            return diffInSeconds + " seconds ago.";
        }
        else {
            return diffInSeconds + " second ago.";
        }
        
    }
    else if (diffInHours === 0) {
        if (diffInMinutes !== 1){
            return diffInMinutes + " minutes ago.";
        }
        else {
            return diffInMinutes + " minute ago.";
        }
    }
    else {
        if (diffInHours !== 1){
            return diffInHours + " hours ago.";
        }
        else {
            return diffInHours + " hour ago.";
        }
    }
    }
    else if (diffInHours >= 24 && diffInYears === 0) {
    return questionDate.toLocaleString('en-us', {month: 'short', day: 'numeric'}) + " at " + questionDate.toLocaleString('en-us', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    else {
    return questionDate.toLocaleDateString('en-us', { month: 'short', day: 'numeric', year: 'numeric' }) + " at " +  questionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

}

export default function QuestionCard(props) {
    const question = props.question;
    const changeContent = props.changeContent;
    const changeMenuItem = props.changeMenuItem;
    const changeSelectedQuest = props.changeSelectedQuest;

    const ansOnClick = async (question) => {
        try {
            const response = await axios.put(`http://localhost:8000/questions/${question._id}/views`);
            changeSelectedQuest(response.data);
            if (!props.fromProfilePage) {
                changeMenuItem("none");
                changeContent("answerPage");
            }
            else {
                changeContent("profileAnswerPage");
            }

        } catch (error) {
            console.log(error);
        }
    }
    

    return (
        <div className="question-div"> 
            <div style={{width: "15%", textAlign: "center", padding: "0px 50px"}}> 
                <p className="num-answers-views"> {question.answers.length + (question.answers.length !== 1 ? " answers" : " answer")} </p>
                <p className="num-answers-views"> {question.views + (question.views !== 1 ? " views" : " view")} </p> 
                <p className="num-answers-views"> {question.votes + (question.votes !== 1 ? " votes" : " vote")} </p>
            </div>
            <div style={{width: "50%"}}> 

                
                <button className="link-text" style={{fontSize: "18px", textAlign: "left"}} onClick={() => ansOnClick(question)}> {question.title}</button>
                <p className="question-summary"> {question.summary} </p>
                <div className="tags-container">

                    {question.tags.map((tag, index) => {
                        return <div key = {index} className="tag"> {tag.name} </div>
                    })}
                </div>
            </div>
            <div style={{width: "35%"}}> 
                <span style= {{color: "red"}}> {question.asked_by} </span> {"asked "}
                {generateMetadataString(question.ask_date_time)} 
            </div>
        </div>
    )
}