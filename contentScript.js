console.log('[vibinex] Running content script');

const keyToLabel = Object.freeze({
	'relevant': "Relevant",
	'important': "Important"
})

function addingCssElement(elementId, status, numRelevantFiles) {
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
				addingCssElement(prNumber, keyToLabel[priorityLevel], highlightedPRIds[priorityLevel][prNumber]['num_files_changed'])
			}
		}
	}
};

function addCssElementToBitbucket() {
	setTimeout(() => {

		let tables = document.getElementsByTagName('table');
		tables = tables[0];

		let allLinks = Array.from(tables.getElementsByTagName('a'));
		allLinks.map((item) => {
			const beforeElement = document.createElement('span');
			beforeElement.innerText = 'Important (1)';
			beforeElement.style.display = 'inline-block';
			beforeElement.style.marginRight = '5px';
			beforeElement.style.backgroundColor = '#e80f00';
			beforeElement.style.color = 'white';
			beforeElement.style.padding = '2px';
			beforeElement.style.paddingLeft = '5px';
			beforeElement.style.paddingRight = '5px'
			beforeElement.style.borderRadius = '3px';
	
			let parent = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
			parent.style.backgroundColor = '#ffbab5';
			parent.style.borderRadius='2px';
			item.insertBefore(beforeElement, item.firstChild);
		});
	}, 1500);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log("[contentScript] message received", request)
	if (request.message === 'urlUpdated') {
		if (request.repo_function === 'pulls') {
			getHighlightedPR(request.repo_owner, request.repo_name);
		}
	}

	if (request.message === 'bitBucketUrl') {
		console.log('[bitBucket CSS changed]');
		addCssElementToBitbucket();
	}
});



