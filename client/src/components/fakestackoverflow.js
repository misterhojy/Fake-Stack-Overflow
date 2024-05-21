import Banner from './Banner.js';
import SideMenu from './Sidemenu.js';
import ContentArea from './ContentArea.js';
import WelcomePage from './WelcomePage.js';
import RegisterPage from './RegisterPage.js';
import LoginPage from './LoginPage.js';
import { useState } from 'react';

export default function FakeStackOverflow() {
    //whatever the user entered in the search bar
    const [searchText, setSearchText] = useState("");
    //the content to show 
    const [content, setContent] = useState("homePage");
    //the menu item the user has selected
    const [menuItem, setMenuItem] = useState("questions");
    //which tag is currently selected
    const [selectedTag, setSelectedTag] = useState("none");
    //which answer is currently selected
    const [selectedQuest, setSelectedQuest] = useState(null);
    //which page are we currently on
    const [activePage, setActivePage] = useState("Welcome");
    //are we currently logged in
    const [loggedIn, setLoggedIn] = useState(false);
    //are we an admin
    const [isAdmin, setIsAdmin] = useState(false);
  
  
    const changeSearchText = (newSearchText) => {
      setSearchText(newSearchText);
    }
  
    const changeContent = (newContent) => {
      setContent(newContent);
    }
  
    const changeMenuItem = (newMenuItem) => {
      setMenuItem(newMenuItem);
    }
  
    const changeSelectedTag = (tag) => {
      setSelectedTag(tag);
    }
  
    const changeSelectedQuest = (question) => {
      setSelectedQuest(question);
    }

    const changeActivePage = (page) => {
      setActivePage(page);
    }

    const changeLoggedIn = (newval) => {
      setLoggedIn(newval);
    }

    const changeIsAdmin = (bool) => {
      setIsAdmin(bool);
    }

    switch (activePage) {
      case "Welcome":
        return <WelcomePage changeLoggedIn = {changeLoggedIn} changeIsAdmin = {changeIsAdmin} changeActivePage = {changeActivePage}> </WelcomePage> 

      case "Main":
        return (
          <div id = "app"> 
            <Banner changeIsAdmin = {changeIsAdmin} changeActivePage = {changeActivePage} loggedIn = {loggedIn} changeLoggedIn = {changeLoggedIn} changeSearchText = {changeSearchText} changeContent = {changeContent}> </Banner>
            <div id ="main"> 
              <SideMenu loggedIn = {loggedIn} isAdmin = {isAdmin} menuItem = {menuItem} changeMenuItem = {changeMenuItem} changeContent = {changeContent}  changeSelectedTag = {changeSelectedTag}> </SideMenu>
              <ContentArea loggedIn = {loggedIn} isAdmin = {isAdmin} content={content} changeContent = {changeContent} searchText = {searchText}  selectedTag = {selectedTag} changeSelectedTag = {changeSelectedTag} changeSelectedQuest = {changeSelectedQuest} selectedQuest = {selectedQuest} changeMenuItem = {changeMenuItem}> </ContentArea>
            </div>
          </div>
        );

      case "Register":
        return (
          <RegisterPage changeActivePage={changeActivePage}> </RegisterPage>
        )
      case "Login":
        return (
          <LoginPage changeLoggedIn={changeLoggedIn} changeIsAdmin = {changeIsAdmin} changeActivePage = {changeActivePage} changeContent = {changeContent}> </LoginPage>
        )
        
      default:
        return (
          <div>
            Default Page
          </div>
        )
        
    }

    
}