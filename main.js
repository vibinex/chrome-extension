function addingImportantCss(elementId) {
  document.getElementById(elementId).style.backgroundColor='rgb(61, 0, 0)';
  let element = document.head.appendChild(document.createElement("style"));
  element.innerHTML = `#${elementId}_link::before{
    background-color:red;
    content: 'Important';
    color: white;
    width: 12px;
    height: 12px;
    border: rgb(45, 0, 0);
    border-radius: 5px;
    margin-right: 10px;
    padding-left: 5px;
    padding-right: 5px;
    padding-bottom: 2px;;}`;
};

function addingRelevantCss(elementId,) {
  document.getElementById(elementId).style.backgroundColor='rgb(86, 88, 0)';
  let element = document.head.appendChild(document.createElement("style"));
  element.innerHTML = `#${elementId}_link::before{
    background-color: rgb(164, 167, 0);
    content: 'Relevant';
    color: white;
    width: 12px;
    height: 12px;
    border: rgb(45, 0, 0);
    border-radius: 5px;
    margin-right: 10px;
    padding-left: 5px;
    padding-right: 5px;
    padding-bottom: 2px;;}`;
};

//sending url which contain repo name 
// to do : getting user info for sending to backend
let url = window.location.toString();

// data getting from api 
const output = [
  {
    important: ['issue_36485','issue_36458','issue_36462'],
    relevant: ['issue_36460','issue_36483','issue_36466']
  }
];

output[0].important.map((item)=>{
  addingImportantCss(item)
});

output[0].relevant.map((item)=>{
  addingRelevantCss(item)
});