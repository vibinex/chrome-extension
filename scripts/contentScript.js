console.log('[vibinex] Running content script');
'use strict';

const keyToLabel = Object.freeze({
	'relevant': "Relevant",
	'important': "Important"
});

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

async function sha256(value) {
	const buffer = new TextEncoder().encode(value);
	const hash = await crypto.subtle.digest('SHA-256', buffer);
	const hexString = Array.from(new Uint8Array(hash))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
	return hexString;
}

// for showing all tracked/ untrack pr in a organization
async function getTrackedRepos(orgName) {
	chrome.storage.sync.get(["backendUrl"]).then(async ({ backendUrl }) => {
		const body = { "org": `${orgName}` }
		const url = `${backendUrl}/setup/repos`;
		const trackedRepos = await apiCall(url, body);
		if (trackedRepos) {
			return trackedRepos;
		};
	})
}

async function updateTrackedReposInOrgGitHub(orgName) {
	const trackedRepos = await getTrackedRepos(orgName);
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
			beforePsuedoElement.href = "";
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

// adding favButton
async function showFloatingActionButton(orgName, orgRepo) {

	const trackedRepoList = await getTrackedRepos(orgName);

	if (!trackedRepoList.includes(orgRepo)) {
		const PrSection = document.getElementById('repo-content-pjax-container');
		// for vibinex logo
		const img = document.createElement("img");
		img.setAttribute('id', 'vibinexLogo')
		img.src = "https://vibinex.com/favicon.ico";
		img.style.width = '35px';
		img.style.height = '35px';
		img.style.borderRadius = '35px';
		img.style.position = 'fixed';
		img.style.left = '30px';
		img.style.bottom = '50px';
		img.style.cursor = 'pointer';
		// for redirecting if the repo is not added 
		const redirectLink = document.createElement('a');
		redirectLink.href = 'https://www.vibinex.com';
		redirectLink.style.position = 'fixed';
		redirectLink.style.left = '58px';
		redirectLink.style.bottom = '45px';
		redirectLink.style.zIndex = '101';
		// for adding plusIcon
		const plusIcon = document.createElement('img');
		plusIcon.src = "https://img.freepik.com/free-icon/add-button-with-plus-symbol-black-circle_318-48599.jpg";
		plusIcon.style.width = '35px';
		plusIcon.style.height = '35px';
		plusIcon.style.borderRadius = '35px';
		plusIcon.style.cursor = 'pointer';
		redirectLink.appendChild(plusIcon);
		redirectLink.appendChild(img);

		const infoBanner = document.createElement('div');
		infoBanner.setAttribute('id', 'vibinex-info');
		// tooltip value on hover 
		function changeCss(value) {
			infoBanner.innerHTML = 'Add to Vibinex';
			infoBanner.style.backgroundColor = 'black';
			infoBanner.style.color = 'white';
			infoBanner.style.padding = '10px';
			infoBanner.style.display = value ? 'block' : 'none';
			infoBanner.style.position = 'fixed';
			infoBanner.style.left = '30px';
			infoBanner.style.bottom = '85px';
			infoBanner.style.borderColor = 'red';
			infoBanner.style.border = "thin solid #D6D6D6";
			infoBanner.style.borderRadius = '5px';
			infoBanner.style.zIndex = '100'
		}
		plusIcon.addEventListener('mouseover', () => changeCss(true));
		plusIcon.addEventListener('mouseout', () => changeCss(false));

		PrSection.appendChild(redirectLink);
		PrSection.appendChild(infoBanner);
	}
}

// showing the important files in a pr
async function showImpFileInPr(repoOwner,repoName,userId) {
	const body = {
		"repo_owner": repoOwner,
		"repo_name": repoName,
		"user_id": userId,
		"is_github": true
	}
	let hashList = await apiCall(url,body);
	// check the hashString and the last extension 
	function checkString(hashString, lastExtension) {
		let value = false;
		hashList.forEach(item => {
			let fileString = item.split('.');
			let language = fileString.pop();
			item = fileString.join(".");
			if (hashString === item && lastExtension === language) {
				return value = true;
			}
		})
		return value;
	}

	const fileNav = document.querySelector('[aria-label="File Tree Navigation"]');
	const fileList = Array.from(fileNav.getElementsByTagName('li'));
	fileList.forEach(async (item) => {
		let elements = item.getElementsByClassName('ActionList-item-label');
		if (elements.length == 1) {
			let text = elements[0].innerHTML.trim();
			let fileString = text.split('.');
			let languageString = fileString.pop();
			text = fileString.join(".");
			const hashedValue = await sha256(text);
			if (checkString(hashedValue, languageString)) {
				item.style.backgroundColor = '#7a7e00';
			}
		}
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

		if (request.message === 'showImpFileInPR') {
			showImpFileInPr(request.repo_owner, request.repo_name, request.userId);
		}

		if (request.message === 'bitbucketUrl') {
			// testing data 
			const highlightedIds = { Important: [1, 2, 3], Relevant: [4, 5, 6] }
			// todo : making a api call for fething the data for bitBucket. 
			addCssElementToBitbucket(highlightedIds, userId);
		}
		if (request.message === 'trackRepo') {
			updateTrackedReposInOrgGitHub(request.org_name);
		}
		if (request.message == 'checkRepo') {
			showFloatingActionButton(request.org_name, request.org_repo);
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