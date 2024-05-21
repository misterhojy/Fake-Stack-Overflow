import React, { useEffect, useState } from 'react';
import {FormInput, FormEnd} from './FormComponents';
import axios from 'axios';


export default function AnswerForm(props) {
    
    const changeMenuItem = props.changeMenuItem;
    const changeContent = props.changeContent;
    const selectedQuest = props.selectedQuest;
    const changeSelectedQuest = props.changeSelectedQuest;

    const name = "ans-question-button"

    let defaultVal = "";
    if (props.currentAnswer) {
        defaultVal = props.currentAnswer.text;
    }
        
    //change menu item when rendered
    useEffect(() => {
        changeMenuItem("None");
    });

    const [inputs, setInputs] = useState({
        text: ''
    });

    const [errors, setErrors] = useState({
        text: ''
    });

    
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setInputs(prevInputs => ({
            ...prevInputs,
            [name]: value.trim()
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        let newErrors = { text: '' };
        let isValid = true;

        if (!inputs.text) {
            newErrors.text = 'Answer text cannot be empty.';
            isValid = false;
        }

        const regex = /\[(.*?)\]\((.*?)\)/g;
        const matches = [...inputs.text.matchAll(regex)];
        matches.forEach(match => {
            if (!match[2].trim()) {
                newErrors.text = 'Text in parentheses cannot be empty after brackets.';
                isValid = false;
            } else if (!match[2].startsWith('http://') && !match[2].startsWith('https://')) {
                newErrors.text = 'Links must start with "http://" or "https://".';
                isValid = false;
            }
        });

        setErrors(newErrors);

        if (isValid) {
            // create a new answer objct
            const newAnswer = {
                text: inputs.text,
                ans_by: inputs.user,
            };


            if (props.currentAnswer) {
                console.log("Updating answer: " + props.currentAnswer.text);
                console.log("new ans: ", newAnswer);
                axios.post(`http://localhost:8000/updateAnswer/${props.currentAnswer._id}`, newAnswer, {withCredentials: true})
                    .then(function (response) {
                        changeContent("answerPage");
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                return;
            }
            // send the axios POST request with the newanswer data
            axios.post(`http://localhost:8000/answers/${selectedQuest._id}`, newAnswer, { withCredentials: true })
                .then(function (response) {
                    changeSelectedQuest(response.data);
                    changeContent("answerPage");
                })
                .catch(function (error) {
                    console.log(error);
                });
            
        }

    };

    return (
        <div id = "content">
                <form id="form-div" onSubmit={handleSubmit}>
                    <FormInput text="Answer Text*" boxsize="biggest" name="text" onChange={handleInputChange} error={errors.text} defaultText = {defaultVal}> </FormInput>
                    <FormEnd text="Answer Question" name={name}> </FormEnd>
                </form>            
            
        </div>
    )

}