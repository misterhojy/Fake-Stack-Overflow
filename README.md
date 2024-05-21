[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/tRxoBzS5)
Add design docs in *images/*

## Instructions to setup and run project
Install all to run the application
In server directory
- npm install
- npm install express
- npm install mongoose

In client directory
- npm install
- npm install axios

Now to run application
run backend server
- nodemon server/server.js

Go in client directory, to launch frontend
- npm start

initialize database
- node server/init.js
- NOTE: You must provide the admin's email and password as the first and second command line arguments
- NOTE: The admin's username is the same as their email
- NOTE: The initialization creates several dummy users/questions/answers

Once all is done, the application will be launched and you can now use the application!


## Team Member 1 Contribution
Hojat Jaffary 114450397
Additions:
- New Question Form
- New Question Form Constraints
- New Question in DB
- Removing New Question Form for Guests
- Creating Answer Page
- Showcasing Views, Votes, Tags, Comments, and Answer
- Created Comment Schema for Answers and Questions
- Created Voting System With Constraints for Comments, Answers, and Questions that Affect Rep.
- Display all Comments and Answers Correctly
- Remove Voting and Commenting for Guests

## Team Member 2 Contribution
Jacob Sinanan 114418346
Additions:
- Register New Account
- Login
- Logout
- Home Page
- Searching
- All tags
- Profile Page
- Admin Profile Page
