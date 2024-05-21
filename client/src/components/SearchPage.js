import QuestionCard from "./QuestionCard";
import { useState, useEffect } from "react";
import axios from "axios";

export default function SearchPage(props) {
    
    const searchText = props.searchText;
    const changeContent = props.changeContent;    
    const changeMenuItem = props.changeMenuItem
    const changeSelectedQuest = props.changeSelectedQuest;


    const [searchResults, setSearchResults] = useState([]);
    const [sorting, setSorting] = useState("newest");
    const [page, setPage] = useState(0);
    
    //Change menu item when rendered
    useEffect(() => {

      const getQuestionsBySearch = (searchTerm, questionsList) => {

        let questions = [];
        const terms = searchTerm.split(" ");
    
        let nonTagTerms = terms.filter((term) => {
          return !(term.startsWith("[") && term.endsWith("]"));
        }).map((nonTagTerm) => nonTagTerm.toLowerCase());
        let tagTerms = terms.filter((term) => {
          return (term.startsWith("[") && term.endsWith("]"));
        })
    
        //for all questions, 
          //if question.title or question.text contains some word from terms, append it to the list
    
        questionsList.forEach((question) => {
    
          if (nonTagTerms.some((term) => {
            return question.text.toLowerCase().split(" ").includes(term) || question.title.toLowerCase().split(" ").includes(term);
          })) {
            if (!questions.includes(question)){
              questions.push(question);
            }
          }
    
          let tagNames = question.tags.map((tag) => {
            return tag.name.toLowerCase();
          })
    
          if (tagTerms.some((term) => {
            return tagNames.includes(term.slice(1, -1).toLowerCase());
          })) {
            if (!questions.includes(question)){
              questions.push(question);
            }
          }
        });
    
        return questions;
      }

      changeMenuItem("questions");
      const getQuestions = async () => {
          const questions = await axios.get("http://localhost:8000/questions");
          setSearchResults(getQuestionsBySearch(searchText, questions.data));
      };
      getQuestions();
    

    }, [changeMenuItem, searchText]); 

    const prevOnClick = () => {
      if (page > 0) {
        setPage(prevState => prevState - 1)
    }
      
    }
    const nextOnClick = () => {
      if (page >= Math.ceil(searchResults.length / 5)-1) {
        setPage(0);
        return;
    }
    setPage(prevState => prevState + 1);
    }


    const sortByNewestFunction = (q1, q2) => {
        if (q1['ask_date_time'] < q2['ask_date_time']) {
          return 1;
        }
        else if (q1['ask_date_time'] > q2['ask_date_time']) {
          return -1;
        }
        else {
          return 0;
        }
      }
    
    const sortByActiveFunction = (q1, q2) => {

        if (q1.answers.length === 0) {
            return 1;
        }
        if (q2.answers.length === 0) {
            return -1;
        }
        const q1Sorted = q1.answers.map((a) => new Date(a.ans_date_time)).sort((a1, a2) => {
            return a2 - a1;
        });
        const q2Sorted = q2.answers.map((a) => new Date(a.ans_date_time)).sort((a1, a2) => {
            return a2 - a1;
        });
        
        return q2Sorted[0] - q1Sorted[0];
    }

    let sortedSearchResults;
    switch (sorting) {
      case "newest":
          sortedSearchResults = searchResults.sort(sortByNewestFunction);
          break;
      case "active":
         sortedSearchResults = searchResults.sort(sortByActiveFunction);
          break;
      case "unanswered":
         sortedSearchResults = searchResults.filter((question) => question.answers.length === 0);
          break;
      default:
          break;
      }

    

    const start = page * 5;
    const end = start + 5;
    sortedSearchResults = sortedSearchResults.slice(start, end);

    const questionCards = sortedSearchResults.map((question, index) => <QuestionCard key={index} question={question} changeMenuItem = {changeMenuItem} changeContent = {changeContent} changeSelectedQuest = {changeSelectedQuest}> </QuestionCard>);


    let results = (sortedSearchResults.length === 0 ? <p id="no-questions-found"> No Questions Found </p> : questionCards);
    
    return (
        <div id = "content"> 
        {<div id = "all-questions-div"> 
        <div id = "first-row">
            <p id="all-questions-text"> {"Search Results"} </p>
            <button className="blue-button" id="ask-question-button" onClick={() => {changeContent("questionForm")}}> Ask Question</button>

        </div>
        <div id = "second-row"> 
            <p id="question-count"> {sortedSearchResults.length} {sortedSearchResults.length === 1 ? "question" : "questions"}</p>
            <div id = "button-group">
                <button className="button-group-class" id="newest-button" onClick={() => {setSorting("newest")}}>Newest</button>
                <button className="button-group-class" id="active-button" onClick={() => {setSorting("active")}}>Active</button>
                <button className="button-group-class" id="unanswered-button" onClick={() => {setSorting("unanswered")}}>Unanswered</button>
            </div>
        </div>

        </div>}
        <div id="questions-list">
            {results}
        </div>

        <div className="pagination-div">
                <button onClick={prevOnClick}> prev </button>
                <p> Page {page}</p>
                <button onClick={nextOnClick}> next </button>
        </div>
    </div>
    
    )

}