import { useState, useEffect } from "react";
import axios from "axios";
import ProfilePage from "./ProfilePage";

function UserLink(props) {
    const user = props.user;

    const [exists, setExists] = useState(true);

    const handleDeleteUser = async () => {

        const deleteUser = async () => {
            
            try {
                await axios.post("http://localhost:8000/deleteUser/" + user._id, {withCredentials: true});
            }
            catch (err) {
                console.log(err);
            }
        }
        
        //Make sure
        const result = window.confirm("Are you sure you want to delete user: " + user.userName + "?");
        if (result) {
            deleteUser()
            setExists(false);
        } else {
            return;
        }
    }
    const goToProfilePage = () => {
        props.changeCurrentUser(user);
        props.changeContent("profilePageFromAdmin");
    }
    if (!exists ){
        return;
    }
    return (
        <div className="user-link">
            <button style={{display: "inline-block"}} className="profile-question-title" onClick = {goToProfilePage}> {user.userName} </button>
            <button style={{float: "right", marginRight: "20px", marginTop: "5px"}} onClick={handleDeleteUser}> Delete User </button>
        </div>
    )
}

export default function AdminProfilePage(props) {

    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {

        const getData = async () => {
            try {
                const users = await axios.get("http://localhost:8000/users", {withCredentials: true});
                setAllUsers(users.data);

            } catch(err) {
                console.log("err: ", err);
            }
        }
        getData();

    }, []);
    

    let errorText = "";
    const userLinks = allUsers.map((user, index) => <UserLink key={index} user = {user} changeContent = {props.changeContent} changeSelectedQuest = {props.changeSelectedQuest} changeCurrentUser = {props.changeCurrentUser}> </UserLink>);
    if (userLinks.length === 0) {
        errorText = "There are no users in the system";
    } else (errorText = "");


    return (
        <div id="content">
            <ProfilePage changeCurrentAnswer = {props.changeCurrentAnswer} changeCurrentUser = {props.changeCurrentUser} isAdmin = {true} changeSelectedQuest = {props.changeSelectedQuest} changeContent = {props.changeContent} changeCurrentQuestion = {props.changeCurrentQuestion} changeSelectedTag = {props.changeSelectedTag}> </ProfilePage>
            <p style={{marginLeft: "20px", marginTop: "0px", marginBottom: "0px", fontSize: "20px"}}> User List (Admin Only) </p>
            <div className="admin-user-list">
                {userLinks}
                {errorText}
            </div>
        </div>
    )
}