console.log('[vibinex] Running content script');

const keyToLabel = Object.freeze({
	'relevant': "Relevant",
	'important': "Important"
})

function addingCssElementToGithub(elementId, status, numRelevantFiles) {
	const backgroundColor = status == 'Important' ? 'rgb(61, 0, 0)' : 'rgb(86, 88, 0)';
	const tagBackgroundColor = status == 'Important' ? 'rgb(255,0,0)' : 'rgb(164, 167, 0)';
	const row_element = document.getElementById(`issue_${elementId}`);
	if (row_element && row_element != null) {
		row_element.style.backgroundColor = backgroundColor;
		let element = document.head.appendChild(document.createElement("style"));
		// TODO: a better approach would be create a constant CSS for a class, and add the class to the elements in consideration
		element.innerHTML = `#issue_${elementId}_link::before{
		background-color:${tagBackgroundColor};
		content: '${status} (${numRelevantFiles})';
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
};


function addCssElementToBitbucket(highlightedPRIds) {

	// To do : remove this setTimeout method once data is coming from api 
	setTimeout(() => {
		const tables = document.getElementsByTagName('table')[0];
		const allLinks = Array.from(tables.getElementsByTagName('a'));

		function changingCss(id,status,numRelevantFiles = 1){
			const backgroundColor = status == 'Important' ? 'rgb(255, 186, 181)' : 'rgb(241, 245, 73)';
			const tagBackgroundColor = status == 'Important' ? 'rgb(232, 15, 0)' : 'rgb(164, 167, 0)';
			allLinks.forEach((item) => {
				const link = item.getAttribute('href').split('/');
				const prId = link[link.length - 1]; // getting the last element from url which is pr id. 
				if (prId == id) {
					const beforePsuedoElement = document.createElement('span');
					beforePsuedoElement.innerText = `${status} (${numRelevantFiles})`;
					beforePsuedoElement.style.display = 'inline-block';
					beforePsuedoElement.style.marginRight = '5px';
					beforePsuedoElement.style.backgroundColor = `${tagBackgroundColor}`;
					beforePsuedoElement.style.color = 'white';
					beforePsuedoElement.style.padding = '2px';
					beforePsuedoElement.style.paddingLeft = '5px';
					beforePsuedoElement.style.paddingRight = '5px'
					beforePsuedoElement.style.borderRadius = '3px';
					const parent = item.closest('tr');
					parent.style.backgroundColor = `${backgroundColor}`;
					parent.style.borderRadius = '2px';
					item.insertBefore(beforePsuedoElement, item.firstChild);
				};
			});
		}
		for (const priorityLevel in highlightedPRIds) {
			for (const prNumber in highlightedPRIds[priorityLevel]) {
				changingCss(highlightedPRIds[priorityLevel][prNumber],priorityLevel);
			}
		}
	}, 1500);
}

// fetching data from API 
async function getDataFromAPI(repoOwner, repoName) {
	const data = {
		"repo_owner": `${repoOwner}`,
		"repo_name": `${repoName}`,
		"alias_list": ["tapish303@gmail.com", "tapish@vibinex.com", "tapish@iitj.ac.in"],
		"is_github": true
	}
	let highlightedPRIds;
	try {
		await fetch('https://gcscruncsql-k7jns52mtq-el.a.run.app/relevance/pr', {
			method: "POST",
			headers: {
				"Access-Control-Allow-Origin": "no-cors",
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			body: JSON.stringify(data)
		})
			.then((response) => response.json())
			.then((data) => highlightedPRIds = data);
		return highlightedPRIds;
	} catch (e) {
		console.error('[vibinex] Error while getting data from API', e)
	}
}

// adding css elements based up the data getting from api
async function getHighlightedPR(repoOwner, reponame) {
	const highlightedPRIds = await getDataFromAPI(repoOwner, reponame);
	if (highlightedPRIds) {
		for (const priorityLevel in highlightedPRIds) {
			for (const prNumber in highlightedPRIds[priorityLevel]) {
				addingCssElementToGithub(prNumber, keyToLabel[priorityLevel], highlightedPRIds[priorityLevel][prNumber]['num_files_changed'])
			}
		}
	}
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log("[contentScript] message received", request)
	if (request.message === 'githubUrl') {
		if (request.repo_function === 'pulls') {
			getHighlightedPR(request.repo_owner, request.repo_name);
		}
	}
	if (request.message === 'bitbucketUrl') {	
		// testing data 
		const highlightedIds = {Important:[1,2,3],Relevant:[4,5,6]}
		// todo : making a api call for fething the data for bitBucket. 
		addCssElementToBitbucket(highlightedIds);
	}
});



