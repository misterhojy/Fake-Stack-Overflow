import HomePage from "./HomePage";
import SearchPage from "./SearchPage";
import TagsPage from "./TagsPage";
import QuestionForm from "./FormComponents";
import AnswerPage from "./AnswerPage";
import AnswerForm from "./AnswerForm";
import ProfilePage from "./ProfilePage";
import AdminProfilePage from "./AdminProfilePage";
import { useState } from "react";


export default function ContentArea(props) {

    const content = props.content;
    const searchText = props.searchText;
    const sorting = props.sorting;
    const changeSorting = props.changeSorting;
    const changeContent = props.changeContent;
    const changeMenuItem = props.changeMenuItem;
    const changeSelectedTag = props.changeSelectedTag;
    const selectedTag = props.selectedTag;
    const changeSelectedQuest = props.changeSelectedQuest;
    const selectedQuest = props.selectedQuest;
    const loggedIn = props.loggedIn;
    const isAdmin = props.isAdmin;

    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentAnswer, setCurrentAnswer] = useState(null);
    const changeCurrentQuestion = (question) => {
        setCurrentQuestion(question);
    }
    const changeCurrentUser = (usr) => {
        setCurrentUser(usr);
    }
    const changeCurrentAnswer = (answr) => {
        setCurrentAnswer(answr);
    }

    switch (content) {

        case "homePage":
            return (
                <HomePage loggedIn = {loggedIn} sorting ={sorting} changeSorting = {changeSorting} changeContent = {changeContent} changeMenuItem = {changeMenuItem} changeSelectedQuest = {changeSelectedQuest}> </HomePage>
            )

        case "searchPage":
            return (
                <SearchPage searchText={searchText} changeSorting = {changeSorting} changeContent = {changeContent} changeMenuItem = {changeMenuItem} changeSelectedQuest = {changeSelectedQuest}> </SearchPage>
            )

        case "tagsPage":
            return (
                <TagsPage loggedIn = {loggedIn} changeSorting = {changeSorting} changeContent = {changeContent} changeSelectedTag = {changeSelectedTag} selectedTag = {selectedTag} changeMenuItem = {changeMenuItem} changeSelectedQuest = {changeSelectedQuest}> </TagsPage>
            )

        case "questionForm":
            return (
                <QuestionForm changeMenuItem = {changeMenuItem} changeContent = {changeContent}> </QuestionForm>
            )

        case "answerPage":
            return (
                <AnswerPage loggedIn = {loggedIn} changeContent = {changeContent} selectedQuest = {selectedQuest} changeSelectedQuest = {changeSelectedQuest}> </AnswerPage>
            )
        case "answerForm":
            return (
                <AnswerForm changeMenuItem = {changeMenuItem} changeContent = {changeContent} selectedQuest = {selectedQuest} changeSelectedQuest = {changeSelectedQuest}> </AnswerForm>
            )
        case "profilePage":
            return (
                <ProfilePage user = {null} isAdmin = {isAdmin} changeCurrentUser = {changeCurrentUser}  changeSelectedQuest = {changeSelectedQuest} changeContent = {changeContent} changeCurrentQuestion = {changeCurrentQuestion} changeSelectedTag = {changeSelectedTag}> </ProfilePage>
            )
        case "adminProfilePage":
            return (
                <AdminProfilePage changeSelectedTag = {props.changeSelectedTag} changeContent = {changeContent} changeCurrentUser = {changeCurrentUser}  changeSelectedQuest = {changeSelectedQuest} changeCurrentQuestion = {changeCurrentQuestion}> </AdminProfilePage>
            )
        case "editQuestionForm":
            return (
                <QuestionForm question = {currentQuestion} changeMenuItem = {changeMenuItem} changeContent = {changeContent}> </QuestionForm>
            )
        case "profileAnswerPage":
            return (
                <AnswerPage changeCurrentAnswer = {changeCurrentAnswer} currentUser = {currentUser} currentAnswer = {currentAnswer} fromProfilePage = {true} loggedIn = {loggedIn} changeContent = {changeContent} selectedQuest = {selectedQuest}> </AnswerPage>
            )
        case "editAnswerForm":
            return (
                <AnswerForm currentAnswer = {currentAnswer} changeMenuItem = {changeMenuItem} changeContent = {changeContent} selectedQuest = {selectedQuest} > </AnswerForm>
            )
        case "profilePageFromAdmin":
            return (
                <ProfilePage user = {currentUser} isAdmin = {false} changeCurrentUser = {changeCurrentUser}  changeSelectedQuest = {changeSelectedQuest} changeContent = {changeContent} changeCurrentQuestion = {changeCurrentQuestion} changeSelectedTag = {changeSelectedTag}> </ProfilePage>
            )

            
        default:
            return (
                <div> 
                    <p> Default case </p>
                </div>
            )
        
    }



}