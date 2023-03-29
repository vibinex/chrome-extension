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
		console.error(`[vibinex] Error while getting data from API. URL: ${url}, payload: ${JSON.stringify(body)}`, e)
	}
}

// for showing all tracked/ untrack pr in a organization
async function getTrackedRepos(orgName) {
	const { backendUrl } = await chrome.storage.sync.get(["backendUrl"]);
	const body = { "org": `${orgName}` }
	const url = `${backendUrl}/setup/repos`;
	const trackedRepos = await apiCall(url, body);
	return trackedRepos['repos'];
}

async function updateTrackedReposInOrgGitHub(orgName, websiteUrl) {
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
			beforePsuedoElement.href = `${websiteUrl}/repo?repo_name=${orgRepoName}`;
			beforePsuedoElement.target = '_blank';
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

const orchestrator = (tab_url, websiteUrl, userId) => {
	console.debug(`[vibinex-orchestrator] updated url: ${tab_url}`);
	let urlObj = tab_url.split('/');
	if (!userId && (urlObj[2] === 'github.com' || urlObj[2] === 'bitbucket.org')) {
		console.warn(`[Vibinex] You are not logged in. Head to ${websiteUrl} to log in`);
		// TODO: create a UI element on the screen with CTA to login to Vibinex
	}
	if (urlObj[2] == 'github.com') {
		if (urlObj[3] && (urlObj[3] !== 'orgs') && urlObj[4]) {
			// for showing fav button if org repo is not added, eg : https://github.com/mui/mui-toolpad
			const org_name = urlObj[3];
			const org_repo = urlObj[4];
			showFloatingActionButton(org_name, org_repo);

			if (urlObj[5] === 'pulls') {
				// show relevant PRs
				getHighlightedPR(org_name, org_repo, userId);
			}
		}
		// for showing all tracked repo
		else if (
			(urlObj[3] && urlObj[4] == undefined) ||
			(urlObj[3] == 'orgs' && urlObj[4] && urlObj[5] === 'repositories')) {
			// for woking on this url https://github.com/Alokit-Innovations or https://github.com/orgs/Alokit-Innovations/repositories?type=all type 
			const org_name = (urlObj[3] === "orgs") ? urlObj[4] : urlObj[3];
			updateTrackedReposInOrgGitHub(org_name, websiteUrl);
		}
	}

	if (urlObj[2] === "bitbucket.org" && urlObj[5] === "pull-requests") {
		// testing data 
		const highlightedIds = { Important: [1, 2, 3], Relevant: [4, 5, 6] }
		// todo : making a api call for fething the data for bitBucket. 
		addCssElementToBitbucket(highlightedIds, userId);
	}
};

window.onload = () => {
	chrome.storage.sync.get(["websiteUrl", "userId"]).then(({ websiteUrl, userId }) => {
		console.log("We have the userId:", userId) // FIXME: remove this console.log
		let oldHref = document.location.href;
		orchestrator(oldHref, websiteUrl, userId);
		return new MutationObserver(mutations => {
			mutations.forEach(() => {
				if (oldHref !== document.location.href) {
					oldHref = document.location.href;
					orchestrator(oldHref, websiteUrl, userId);
				}
			})
		}).observe(document.querySelector("body"), { childList: true, subtree: true });
	});
}