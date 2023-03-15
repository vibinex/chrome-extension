console.log('[vibinex] Running content script');

const keyToLabel = Object.freeze({
	'relevant': "Relevant",
	'important': "Important"
})

function addingCssElementToGithub(elementId, status, numRelevantFiles) {
	let backgroundColor = status == 'Important' ? 'rgb(61, 0, 0)' : 'rgb(86, 88, 0)';
	let tagBackgroundColor = status == 'Important' ? 'rgb(255,0,0)' : 'rgb(164, 167, 0)';
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

	// To do : remove this setTime out method once data is coming from api 
	setTimeout(() => {
		let tables = document.getElementsByTagName('table');
		tables = tables[0];
		let allLinks = Array.from(tables.getElementsByTagName('a'));
		function changingCss(id,status,numRelevantFiles = 1){
			let backgroundColor = status == 'Important' ? '#ffbab5' : '#f1f549';
			let tagBackgroundColor = status == 'Important' ? '#e80f00' : 'rgb(164, 167, 0)';
			allLinks.map((item) => {
				let link = item.getAttribute('href').split('/');
				let linkLength = link.length;
				let prId = link[linkLength - 1]; // getting the last element from url which is pr id. 
				if (prId == id) {
					const beforeElement = document.createElement('span');
					beforeElement.innerText = `${status} (${numRelevantFiles})`;
					beforeElement.style.display = 'inline-block';
					beforeElement.style.marginRight = '5px';
					beforeElement.style.backgroundColor = `${tagBackgroundColor}`;
					beforeElement.style.color = 'white';
					beforeElement.style.padding = '2px';
					beforeElement.style.paddingLeft = '5px';
					beforeElement.style.paddingRight = '5px'
					beforeElement.style.borderRadius = '3px';
					let parent = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
					parent.style.backgroundColor = `${backgroundColor}`;
					parent.style.borderRadius = '2px';
					item.insertBefore(beforeElement, item.firstChild);
				};
			});

		}
		for (const priorityLevel in highlightedPRIds) {
			for (const prNumber in highlightedPRIds[priorityLevel]) {
				console.log(highlightedPRIds[priorityLevel][prNumber],priorityLevel);
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
	let heighlightedIds;
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
			.then((data) => heighlightedIds = data);
		return heighlightedIds;
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
	if (request.message === 'urlUpdated') {
		if (request.repo_function === 'pulls') {
			getHighlightedPR(request.repo_owner, request.repo_name);
		}
	}

	if (request.message === 'bitBucketUrl') {
		console.log('[bitBucket CSS changed]');

		// testing data 
		const heighlightedIds = {Important:[1,2,3],Relevant:[2,5,6]}
		// todo : making a api call for fething the data for bitBucket. 
		addCssElementToBitbucket(heighlightedIds);
	}
});



