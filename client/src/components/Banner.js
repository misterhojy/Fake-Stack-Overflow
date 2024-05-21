import axios from "axios";
export default function Banner(props) {

    const onKeyDown = (event) => {
        if (event.key === "Enter") {
            const text = event.target.value;
            props.changeSearchText(text);
            props.changeContent("searchPage");
        }
    }

    const logOut = async () => {

        try {
            await axios.get("http://localhost:8000/logout", {withCredentials: true});
            props.changeLoggedIn(false);
            props.changeActivePage("Welcome");
        } catch (err) {
            console.log(err);
        }
        
    }


    return (
        <div id ="header">
            <h1 id="title"> Fake Stack Overflow </h1>
            <input type="search" name="search" id="search-bar" placeholder="Search..." onKeyDown={onKeyDown}/>
            {props.loggedIn && <button onClick={logOut} className="blue-button"> Logout </button>}
        </div>
    )
}