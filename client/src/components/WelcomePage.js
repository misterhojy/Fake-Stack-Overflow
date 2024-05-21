import { useEffect } from "react";
import axios from "axios"
export default function WelcomePage(props) {

    const changeActivePage = props.changeActivePage;

    const goToMainPage = () => {
        changeActivePage("Main");
    }

    const goToRegisterPage = () => {
        changeActivePage("Register");
    }

    const goToLoginPage = () => {
        changeActivePage("Login");
    }

    //staying logged in on refresh
    useEffect(() => {
        const stayLoggedIn = async () => {
            try {
                let profile = await axios.get("http://localhost:8000/profile", {withCredentials: true});
                props.changeLoggedIn(true);
                if (profile.isAdmin === true) {
                    props.changeIsAdmin(true);
                }
                goToMainPage();
            }
            catch (err) {
                return;
            }
            
        }

        stayLoggedIn();
    });

    return (
        <div>
            <h1 className="title-text"> Welcome to Fake Stack Overflow! </h1>
            <div id="welcome-button-container"> 
                <button onClick = {goToRegisterPage}  className="welcome-button"> Register New Account </button>
                <button onClick={goToLoginPage}  className="welcome-button"> Login </button>
                <button onClick={goToMainPage}  className="welcome-button"> Continue as Guest </button>
            </div>
        </div>
    )
}