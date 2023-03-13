console.log('Running content script');

function addingCssElement(elementId, status) {
	let backgroundColor = status == 'Important' ? 'rgb(61, 0, 0)' : 'rgb(86, 88, 0)';
	let tagBackgroundColor = status == 'Important' ? 'rgb(255,0,0)' : 'rgb(164, 167, 0)';
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

// fetching data from API 
async function getDataFromAPI(repoOwner, repoName) {
	const data = {
		"repo_owner": `${repoOwner}`,
		"repo_name": `${repoName}`,
		"alias_list": ["tapish303@gmail.com", "tapish@vibinex.com", "tapish@iitj.ac.in"],
		"is_github": true
	}
	let heighlightedIds;
	try {
		await fetch('https://gcscruncsql-k7jns52mtq-el.a.run.app/relevance/pr', {
			method: "POST",
			headers: {
				"Access-Control-Allow-Origin":"no-cors",
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			body: JSON.stringify(data)
		})
			.then((response) => response.json())
			.then((data) => heighlightedIds = data);
		return heighlightedIds;
	} catch (e) {
		console.log('Error while getting data from API', e)
	}
}

// adding css elements based up the data getting from api
async function getHighlightedPR(repoOwner, reponame) {
	const highlightedPRIds = await getDataFromAPI(repoOwner, reponame);
	if (highlightedPRIds) {
		let maxLengthIds = Math.max(
			"important" in highlightedPRIds ? highlightedPRIds.important.length : 0,
			"relevant" in highlightedPRIds ? highlightedPRIds.relevant.length : 0
		);
		// const highlightedPRIds = {
		//   important: [36485, 36458, 36462, 36492],
		//   relevant: [36460, 36483, 36466]
		// };
		for (let i = 0; i < maxLengthIds; i++) {
			if ("relevant" in highlightedPRIds) {
				highlightedPRIds.relevant[i] ? addingCssElement(highlightedPRIds.relevant[i], 'Relevant') : null;
			}
			if ("relevant" in highlightedPRIds) {
				highlightedPRIds.important[i] ? addingCssElement(highlightedPRIds.important[i], 'Important') : null;
			}
		}
	}
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log("[contentScript] message received", request)
	if (request.message === 'urlUpdated') {
		console.log('Sending Request to API')
		getHighlightedPR(request.repo_owner, request.repo_name);
		// console.log(request.urls)
	}
});

