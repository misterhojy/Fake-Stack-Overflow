export default function SideMenu(props) {

    const menuItem = props.menuItem;
    const changeMenuItem = props.changeMenuItem;
    const changeContent = props.changeContent;
    const changeSelectedTag = props.changeSelectedTag;
    const isAdmin = props.isAdmin;

    
    const questionsOnClick = () => {
        changeMenuItem("questions");
        changeContent("homePage");
        
    }

    const tagsOnClick = () => {
        changeMenuItem("tags");
        changeContent("tagsPage");
        changeSelectedTag("none");
    }

    const profileOnClick = () => {
        changeMenuItem("profile");
        if (isAdmin) {
            changeContent("adminProfilePage");
            return;
        }
        else {
            changeContent("profilePage");
        }
    }

    //highlight the correct menu item
    let questionsBackgroundColor = {backgroundColor: "white"};
    let tagsBackgroundColor = {backgroundColor: "white"};
    let profileBackgroundColor = {backgroundColor: "white"};
    if (menuItem === "questions") {
        questionsBackgroundColor = {backgroundColor: "#c9c9c9"};
    }
    else if (menuItem === "tags") {
        tagsBackgroundColor = {backgroundColor: "#c9c9c9"};
    }
    else if (menuItem === "profile") {
        profileBackgroundColor = {backgroundColor: "#c9c9c9"}
    }

    return (
        <div id ="menu">
            <div className="menu-item-div" style={questionsBackgroundColor}>
                <button className="link-text" style={questionsBackgroundColor} onClick={() => questionsOnClick()}> Questions </button>
            </div>

            <div className="menu-item-div" style={tagsBackgroundColor}>
                <button className="link-text" id="tags-link" style={tagsBackgroundColor} onClick={() => tagsOnClick()}> Tags </button>
            </div>

            {props.loggedIn && <div className="menu-item-div" style={profileBackgroundColor}>
                <button className="link-text" style={profileBackgroundColor} onClick={() => profileOnClick()}> Profile </button>
            </div>}
        </div>
    )
}