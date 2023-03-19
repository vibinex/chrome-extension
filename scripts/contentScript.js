console.log('[vibinex] Running content script');
'use strict';

const keyToLabel = Object.freeze({
	'relevant': "Relevant",
	'important': "Important"
})

async function cssForGithubTrackRepo(trackedRepos) {
	const allOrgRepo = document.getElementById('org-repositories');
	const orgRepoUrl = Array.from(allOrgRepo.getElementsByTagName('a'));

	orgRepoUrl.forEach((item) => {
		const link = item.getAttribute('href').split('/');
		const orgRepoName = link[link.length - 1];

		if (trackedRepos.includes(orgRepoName)) {
			const img = document.createElement("img");
			const beforePsuedoElement = document.createElement('a');
			img.src = "https://vibinex.com/favicon.ico";
			img.style.width = '15px'
			img.style.height = '15px'

			beforePsuedoElement.appendChild(img);
			beforePsuedoElement.href = "#";
			beforePsuedoElement.style.display = 'inline-block';
			beforePsuedoElement.style.marginRight = '2px';
			beforePsuedoElement.style.color = 'white';
			beforePsuedoElement.style.borderRadius = '2px';
			beforePsuedoElement.style.fontSize = '15px';
			beforePsuedoElement.style.textDecoration = 'none';
			item.insertBefore(beforePsuedoElement, item.firstChild);
		}

	})

}

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


function addCssElementToBitbucket(highlightedPRIds, userId) {

	// To do : remove this setTimeout method once data is coming from api 
	setTimeout(() => {
		const tables = document.getElementsByTagName('table')[0];
		const allLinks = Array.from(tables.getElementsByTagName('a'));

		function changingCss(id, status, numRelevantFiles = 1) {
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
				changingCss(highlightedPRIds[priorityLevel][prNumber], priorityLevel);
			}
		}
	}, 1500);
}

async function apiCall(url, body) {
	try {
		let dataFromAPI;
		await fetch(url, {
			method: "POST",
			headers: {
				"Access-Control-Allow-Origin": "no-cors",
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			body: JSON.stringify(body)
		})
			.then((response) => response.json())
			.then((data) => dataFromAPI = data);
		return dataFromAPI;
	} catch (e) {
		console.error('[vibinex] Error while getting data from API', e)
	}
}

// adding css elements based up the data getting from api
function getHighlightedPR(repoOwner, repoName, userId) {
	chrome.storage.sync.get(["backendUrl"]).then(async ({ backendUrl }) => {
		const body = {
			"repo_owner": repoOwner,
			"repo_name": repoName,
			"user_id": userId,
			"is_github": true
		}
		const url = `${backendUrl}/relevance/pr`;
		const highlightedPRIds = await apiCall(url, body);
		if (highlightedPRIds) {
			for (const priorityLevel in highlightedPRIds) {
				for (const prNumber in highlightedPRIds[priorityLevel]) {
					addingCssElementToGithub(prNumber, keyToLabel[priorityLevel], highlightedPRIds[priorityLevel][prNumber]['num_files_changed'])
				}
			}
		}
	})
};

// for showing all tracked/ untrack pr in a organization
function getTrackedPR(orgName) {
	chrome.storage.sync.get(["backendUrl"]).then(async ({ backendUrl }) => {
		const body = { "org": `${orgName}` }
		const url = `${backendUrl}/setup/repos`;
		const trackedRepos = await apiCall(url, body);
		if (trackedRepos) {
			cssForGithubTrackRepo(trackedRepos);
		};
	})
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log("[contentScript] message received", request)
	chrome.storage.sync.get(["websiteUrl", "userId"]).then(({ websiteUrl, userId }) => {
		if (!userId && (request.message === 'githubUrl' || request.message === 'bitbucketUrl')) {
			console.warn(`[Vibinex] You are not logged in. Head to ${websiteUrl} to log in`);
			// TODO: create a UI element on the screen with CTA to login to Vibinex
		}
		if (request.message === 'githubUrl') {
			if (request.repo_function === 'pulls') {
				getHighlightedPR(request.repo_owner, request.repo_name, userId);
			}
		}

		if (request.message === 'bitbucketUrl') {
			// testing data 
			const highlightedIds = { Important: [1, 2, 3], Relevant: [4, 5, 6] }
			// todo : making a api call for fething the data for bitBucket. 
			addCssElementToBitbucket(highlightedIds, userId);
		}

		if (request.message === 'trackRepo') {
			getTrackedPR(request.org_name);
		}
	})
});

chrome.storage.sync.get(["websiteUrl", "userId"]).then(({ websiteUrl, userId }) => {
	window.addEventListener("message", (event) => {
		if (event.origin !== websiteUrl) return;
		if (event.data.message === "refreshSession") {
			if (!event.data.userId) {
				console.warn("[contentScript] event object does not contain userId", event.data);
			}
			chrome.storage.sync.set({
				userId: event.data.userId,
				userName: event.data.userName,
				userImage: event.data.userImage
			}).then(() => {
				console.debug(`[contentScript] userId has been set from ${userId} to ${event.data.userId}`);
			}).catch(err => {
				console.error(`[contentScript] Sync storage could not be set. initial userId: ${userId}; final userId: ${event.data.userId}`, err);
			})
		}
	}, false)
})