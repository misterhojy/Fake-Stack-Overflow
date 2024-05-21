import { useState } from "react";
import axios from "axios";
export default function LoginPage(props) {

    const changeActivePage = props.changeActivePage;
    const changeLoggedIn = props.changeLoggedIn;
    const changeIsAdmin = props.changeIsAdmin;
    const changeContent = props.changeContent;

    const [inputData, setInputData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        email: false,
        password: false
    })

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputData(prevState => ({
        ...prevState,
        [name]: value
        }));

        setErrors({
            email: false,
            password: false
        });
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        loginUser()
        
    }

    const loginUser = async () => {
        try {
            const response = await axios.post("http://localhost:8000/login", inputData, {withCredentials: true});
            changeActivePage("Main");
            changeContent("homePage");
            changeLoggedIn(true);
            if (response.data.user.isAdmin) {
                changeIsAdmin(true);
            }
            else {
                changeIsAdmin(false);
            }
            
        }
        catch (error) {
            console.log("There was an ERROR")
            if (error.response.data.errorType === "email") {
                setErrors(prevState => ({
                    ...prevState,
                    email: true
                    }));
            }
            else if (error.response.data.errorType === "password") {
                setErrors(prevState => ({
                    ...prevState,
                    password: true
                    }));
            }
        }

    }


    return (
        <div>
            <h1 className="title-text"> Login </h1>
            <div id="register-form-div">
                <form  onSubmit={handleSubmit}  >
                    <p> Email </p>
                    <input
                        type="email"
                        className="register-input"
                        name="email"
                        value={inputData.email}
                        onChange={handleChange}
                        required
                    />
                    <p> Password </p>
                    <input
                        type="password"
                        className="register-input"
                        name="password"
                        value={inputData.password}
                        onChange={handleChange}
                        required
                    />
                    {errors.email && <p className="error-message"> No account registered with this email </p>}
                    {errors.password && <p className="error-message"> Incorrect Password </p>}
                    
                    <button type="submit" className="blue-button" id="signup-button"> Login </button>

                </form>
            </div>

        </div>
    )
}