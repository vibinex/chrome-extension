
let url = window.location.toString(); 
console.log('This is the url',url)


function ElementCreator(elementId,title,priority){
  const newElement = document.createElement("span");
  const  addTitle = document.createTextNode(title);
  newElement.appendChild(addTitle);
  newElement.setAttribute('id',priority);

  const finalElement = document.getElementById(elementId);
  finalElement.appendChild(newElement);
}


function AddingCSS(elementId,title,priority){
  one = document.head.appendChild(document.createElement("style"));
  one.innerHTML = `#${elementId}::before{
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
}



const toCreate=[
  {elementId:'issue_36401_link',title:'Medium',priority:'Medium'},
  {elementId:'issue_36402_link',title:'Low',priority:'Low'},
  {elementId:'issue_36408_link',title:'Low',priority:'Low'},
  {elementId:'issue_36400_link',title:'Medium',priority:'Medium'},
  {elementId:'issue_36404_link',title:'Low',priority:'Low'},
  {elementId:'issue_36405_link',title:'Low',priority:'Low'},
  {elementId:'issue_36407_link',title:'Low',priority:'Low'},
  {elementId:'issue_36409_link',title:'Low',priority:'Low'},
  {elementId:'issue_36410_link',title:'Low',priority:'Low'},

  {elementId:'issue_16_link',title:'High',priority:'High'},
  {elementId:'issue_10_link',title:'High',priority:'High'},
  {elementId:'issue_9_link',title:'High',priority:'High'},
  {elementId:'issue_2_link',title:'Medium',priority:'Medium'},
  {elementId:'issue_8_link',title:'High',priority:'High'},
]

toCreate.map((item)=>{
    AddingCSS(item.elementId);
})
