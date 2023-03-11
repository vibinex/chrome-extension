function addingCssElement(elementId,status) {
  let backgroundColor = status =='Important'?'rgb(61, 0, 0)':'rgb(86, 88, 0)';
  let tagBackgroundColor = status =='Important'?'rgb(255,0,0)':'rgb(164, 167, 0)';
  document.getElementById(`issue_${elementId}`).style.backgroundColor = backgroundColor;
  let element = document.head.appendChild(document.createElement("style"));
  element.innerHTML = `#issue_${elementId}_link::before{
    background-color:${tagBackgroundColor};
    content: '${status}';
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
const highlightedPRIds = {
  important: [36485, 36458, 36462,36492],
  relevant: [36460, 36483, 36466]
};

let maxLengthIds = Math.max(highlightedPRIds.important.length,highlightedPRIds.relevant.length);

for(let i=0;i<maxLengthIds;i++){
  highlightedPRIds.important[i]?addingCssElement(highlightedPRIds.important[i],'Important'):null;
  highlightedPRIds.relevant[i]?addingCssElement(highlightedPRIds.relevant[i],'relevant'):null;
}