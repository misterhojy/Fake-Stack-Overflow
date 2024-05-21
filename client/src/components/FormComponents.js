
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function FormInput(props) {
    const text = props.text;
    const subtext = props.subtext;
    const boxsize = props.boxsize;
    const name = props.name;
    const error = props.error;
    const onChange = props.onChange;
    const defaultText = props.defaultText;

    function renderInputField() {
        if (boxsize === "big") {
            return <textarea name={name} className="form-big-input" cols="95" rows="4" onChange={onChange} defaultValue={defaultText}/>;
        } else if (boxsize === "biggest") {
            return <textarea name={name} className="form-big-input" cols="95" rows="7" onChange={onChange} defaultValue={defaultText}/>;
        } else {
            return <input type="text" name={name} className="form-input" onChange={onChange} defaultValue={defaultText}/>;
        }
    }
    

    return (
        <div className="form-section">
            <p className="form-label">{text}</p>
            <p className="form-sub-label">{subtext}</p>
            {renderInputField()}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export function FormEnd(props) {
    const text = props.text;
    const name = props.name;

    return (
        <div className="final-div">
            <button className="blue-button" id={name} type="submit">{text}</button>
            <span className="end-message">* indicates mandatory fields</span>
        </div>
    )

}

export default function QuestionForm(props) {
    
    const changeMenuItem = props.changeMenuItem;
    const changeContent = props.changeContent;
    const name = "post-question-button"
    
    let questionTitle = "";
    let questionSummary = "";
    let questionText = "";
    let questionTags = "";

    if (props.question) {
        const question = props.question;
        questionTitle = question.title;
        questionSummary = question.summary;
        questionText = question.text;
        questionTags = question.tags.map((tag) => tag.name).join(" ");
    }
    
    //change menu item when rendered
    useEffect(() => {
        changeMenuItem("None");
    });
    
    const [inputs, setInputs] = useState({
        title: questionTitle,
        summary: questionSummary,
        text: questionText,
        tags: questionTags,
    });

    const [errors, setErrors] = useState({
        title: '',
        summary: '',
        text: '',
        tags: '',
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setInputs(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        let newErrors = { title: '', summary: '', text: '', tags: ''};
        let isValid = true;

        if (!inputs.title) {
            newErrors.title = 'Question title cannot be empty.';
            isValid = false;
        }

        if (inputs.title.length > 50) {
            newErrors.title = 'Question title cannot be more than 50 characters.';
            isValid = false;
        }

        if (!inputs.summary) {
            newErrors.summary = 'Question summary cannot be empty.'
            isValid = false;
        }

        if (inputs.summary.length > 140) {
            newErrors.summary = 'Question summary cannot be more than 140 characters.';
            isValid = false;
        }

        if (!inputs.text) {
            newErrors.text = 'Question text cannot be empty.';
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

        if (!inputs.tags) {
            newErrors.tags = 'Question tag cannot be empty.';
            isValid = false;
        }

        const tags = inputs.tags.split(/\s+/);
        if (tags.length > 5) {
            newErrors.tags = 'No more than 5 tags allowed.';
            isValid = false;
        }

        if (tags.some(tag => tag.length > 10)) {
            newErrors.tags = 'Each tag must be no longer than 10 letters.';
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {

            // create a new question object
            const newQuestion = {
                title: inputs.title,
                summary: inputs.summary,
                text: inputs.text,
                tagNames: inputs.tags.split(/\s+/),
            };

            // Updating the question
            if (props.question) {
                
                axios.post('http://localhost:8000/updateQuestion/' + props.question._id, newQuestion, {withCredentials: true})
                    .then((response) => {
                        console.log(response);
                        changeMenuItem("questions");
                        changeContent("homePage");
                    })
                    .catch(function (error) {
                        if (error.response) {
                            const error_type = error.response.data.error;
    
                            if (error_type && error_type.includes("Insufficient reputation to create new tags")) {
                                newErrors.tags = error_type;
                                isValid = false;
                                setErrors(prev => ({
                                    ...prev,
                                    tags: error_type
                                }));
                            }
                            else {
                                console.log(error);
                            }
                        }
                    });

                console.log("UPDATED QUESTION: ", props.question._id);
                return;
            }

            // send the axios POST request with the newQuestion data
            axios.post('http://localhost:8000/questions', newQuestion, { withCredentials: true })
                .then(function (response) {
                    changeMenuItem("questions");
                    changeContent("homePage");
                })
                .catch(function (error) {
                    if (error.response) {
                        const error_type = error.response.data.error;

                        if (error_type && error_type.includes("Insufficient reputation to create new tags")) {
                            newErrors.tags = error_type;
                            isValid = false;
                            setErrors(prev => ({
                                ...prev,
                                tags: error_type
                            }));
                        }
                        else {
                            console.log(error);
                        }
                    }
                }); 
        }

    };

    const handleDelete = () => {
        axios.post("http://localhost:8000/deleteQuestion/" + props.question._id)
            .then((response) => {
                console.log("response for deletion: ", response);
                changeMenuItem("questions");
                changeContent("homePage");
            })
            .catch((err) => {
                console.log("Error in deletin: ", err);
            })
    }



    return (
        <div id = "content">
                <form id="form-div" onSubmit={handleSubmit}>
                    <FormInput text="Question Title*" subtext="Limit title to 50 characters or less" boxsize="small" name="title" onChange={handleInputChange} error={errors.title} defaultText = {questionTitle}> </FormInput>
                    <FormInput text="Question Summary*" subtext="Add summary" boxsize="small" name="summary" onChange={handleInputChange} error={errors.summary} defaultText = {questionSummary}> </FormInput>
                    <FormInput text="Question Text*" subtext="Add details" boxsize="big" name="text" onChange={handleInputChange} error={errors.text} defaultText = {questionText}> </FormInput>
                    <FormInput text="Tags*" subtext="Add keywords seperated by whitespace" boxsize="small" name="tags" onChange={handleInputChange} error={errors.tags} defaultText = {questionTags}> </FormInput>
                    {props.question ? <FormEnd text="Update Question" name = {name} question = {props.question}>  </FormEnd> : <FormEnd text="Post Question" name={name} question = {props.question}> </FormEnd>}
                </form>            
                {props.question && <button id="delete-question-button" onClick={handleDelete} > Delete Question </button>}
        </div>
    )
}