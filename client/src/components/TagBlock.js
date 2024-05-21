import axios from "axios";
import { useState } from "react";
export default function TagBlock(props) {

    const tag = props.tag;
    const questionsList = props.questionsList;

    const [exists, setExists] = useState(true);

    const buttonOnClick = () => {
        props.changeSelectedTag(tag);
        if (props.profilePage) {
            props.changeContent("tagsPage")
        }
    }

    const getNumberOfQuestionsForTag = (tag) => {
        let count = 0;    
        questionsList.forEach((question) => {
        //   if (question.tags.includes(tag)){
        //     count++;
        //   }
            const tags = question.tags.map((tag) => tag.name)
            if (tags.includes(tag.name)) {
                count++
            }
        });
        return count;
      }

    const numQ =  getNumberOfQuestionsForTag(tag);

    

    const handleEditTag = async () => {
        try {
            let newName = window.prompt("Enter new tag name: ").toLowerCase().trim();
            if (newName.length >= 10) {
                throw new ErrorEvent("Tag Name Exceeds Limit");
            }
            await axios.post("http://localhost:8000/updateTag/" + tag._id, {newName: newName}, {withCredentials: true});
            props.changeContent("tagsPage");
        } catch (err) {
            if (err instanceof ErrorEvent) {
                alert("Error: Tag name too long, must be no longer than 10 letters");
            }
            else {
                alert("Error: Tag is being used by others, cannot edit it", err)
            }
        }


    }

    const handleDeleteTag = async () => {
        const deleteTag = async () => {
            try {
                await axios.post("http://localhost:8000/deleteTag/" + tag._id)
                setExists(false);
                props.changeContent("tagsPage");
            } catch (err) {
                console.log(err)
                alert("Error: Tag is being used by others, cannot delete it")
            }
        }
        deleteTag();
    

    }

    if (!exists) {
        return;
    }

    return (
        <div className="tag-block">
            {props.profilePage && <button onClick={handleEditTag}> Edit </button>}
            <button className="link-text" style = {{fontSize: "15px", textDecoration: "underline"}} onClick={buttonOnClick}>
                {tag.name}
            </button>
            {props.profilePage && <button onClick={handleDeleteTag}> Delete </button>}

            <p> {numQ} {numQ === 1 ? " question" : "questions"} </p>
        </div>
    )
}