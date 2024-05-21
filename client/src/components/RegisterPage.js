import React from "react";
import { useState } from "react";
import axios from "axios";

export default function RegisterPage(props) {

    const changeActivePage = props.changeActivePage;

    const [inputData, setInputData] = useState({
        firstName: "",
        lastName: "",
        userName: "",
        email: "",
        password: "",
        passwordVerification: ""
    });

    const [errors, setErrors] = useState({
        passwordError: false,
        mismatchedPassword: false,
        duplicateEmail: false
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputData(prevState => ({
        ...prevState,
        [name]: value
        }));
        setErrors(prevState => ({
            ...prevState,
            passwordError: false,
            passwordVerification: false,
            duplicateEmail: false
            }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const password = inputData.password.toLowerCase();
        const first = inputData.firstName.toLowerCase();
        const last = inputData.lastName.toLowerCase();
        const emailId = inputData.email.split("@")[0].toLowerCase();

        if (password.includes(first) || password.includes(last) || password.includes(emailId)) {
            setErrors(prevState => ({
                ...prevState,
                passwordError: true
                }));
            return;
        }
        setErrors(prevState => ({
            ...prevState,
            passwordError: false
            }));

        if (inputData.password !== inputData.passwordVerification) {
            setErrors(prevState => ({
                ...prevState,
                mismatchedPassword: true
                }));
            return;
        }
        else {
            setErrors(prevState => ({
                ...prevState,
                mismatchedPassword: false
                }));
        }
        // No errors
        registerAccount();
        
    }

    const registerAccount = async () =>  {
        try {
            await axios.post("http://localhost:8000/register", inputData);
            changeActivePage("Login");
        }

        catch (error) {
            setErrors(prevState => ({
                ...prevState,
                duplicateEmail: true
                }));
        }

    }


    return (
        <div>
            <h1 className="title-text" style={{marginBottom: '0'}}> Register New Account </h1>
            <div id="register-form-div">
                <form onSubmit={handleSubmit}>
                    <p> First Name </p>
                    <input
                        type="text"
                        className="register-input"
                        name="firstName"
                        value={inputData.firstName}
                        onChange={handleChange}
                        required
                    />
                    <p> Last Name </p>
                    <input
                        type="text"
                        className="register-input"
                        name="lastName"
                        value={inputData.lastName}
                        onChange={handleChange}
                        required
                    />
                    <p> Username </p>
                    <input
                        type="text"
                        className="register-input"
                        name="userName"
                        value={inputData.userName}
                        onChange={handleChange}
                        required
                    />
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
                    <p> Password Confirmation </p>
                    <input
                        type="password"
                        className="register-input"
                        name="passwordVerification"
                        value={inputData.passwordVerification}
                        onChange={handleChange}
                        required
                    />
                {errors.passwordError && <p className="error-message"> Password cannot contain first or last name or email </p>}
                {errors.mismatchedPassword && <p className="error-message"> Passwords must match </p>}
                {errors.duplicateEmail && <p className="error-message"> Email is already registered </p>}


                <button type="submit" className="blue-button" id="signup-button"> Sign Up </button>
                </form>

            </div>
        </div>
    )
}