console.log('[vibinex] Running content script');
'use strict';

const keyToLabel = Object.freeze({
	'relevant': "Relevant",
	'important': "Important"
});

function createElement(type = "add", websiteUrl = "https://vibinex.com") {
	let loadingIconID;
	let imgUrl;
	let bannerMessage;
	switch (type) {
		case "loading":
			loadingIconID = "vibinexLoadingGif";
			imgUrl = "https://media.tenor.com/wpSo-8CrXqUAAAAi/loading-loading-forever.gif";
			bannerMessage = "Please wait. Vibinex is loading...";
			break;
		case "add":
			loadingIconID = "vibinexPlusIcon";
			imgUrl = "https://img.freepik.com/free-icon/add-button-with-plus-symbol-black-circle_318-48599.jpg";
			bannerMessage = "Add to Vibinex";
			break;
		case "error":
			loadingIconID = "vibinexErrorIcon";
			imgUrl = "https://cdn-icons-png.flaticon.com/512/1243/1243911.png?w=740&t=st=1680153899~exp=1680154499~hmac=be129e6a5a3dd4b9a362138086907f3330050f0a300473c5ed0e7e9541ece2de"
			bannerMessage = "Something went wrong";
			break;
		default:
			break;
	}
	// for vibinex logo
	const img = document.createElement("img");
	img.setAttribute('id', 'vibinexLogo')
	img.src = `${websiteUrl}/favicon.ico`;
	img.style.width = '35px';
	img.style.height = '35px';
	img.style.borderRadius = '35px';
	img.style.position = 'fixed';
	img.style.left = '30px';
	img.style.bottom = '50px';
	img.style.cursor = 'pointer';
	img.style.zIndex='200';

	// for adding plusIcon
	const loadingGif = document.createElement('img');
	loadingGif.setAttribute('id', loadingIconID)
	loadingGif.src = imgUrl;
	loadingGif.style.width = '35px';
	loadingGif.style.height = '35px';
	loadingGif.style.borderRadius = '35px';
	loadingGif.style.cursor = 'pointer';

	// for redirecting to the our website
	const redirectLink = document.createElement('a');
	redirectLink.style.position = 'fixed';
	redirectLink.style.left = '58px';
	redirectLink.style.bottom = '45px';
	redirectLink.style.zIndex = '200';
	if (type === "add") {
		redirectLink.href = `${websiteUrl}/instruction_to_setup`;
	}
	redirectLink.appendChild(loadingGif);
	redirectLink.appendChild(img);

	const infoBanner = document.createElement('div');
	infoBanner.setAttribute('id', 'floating-info');
	// tooltip value on hover 
	function changeCss(value) {
		infoBanner.innerHTML = bannerMessage;
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
		infoBanner.style.zIndex = '200'
	}
	redirectLink.addEventListener('mouseover', () => changeCss(true));
	redirectLink.addEventListener('mouseout', () => changeCss(false));

	document.body.appendChild(redirectLink);
	document.body.appendChild(infoBanner);
}

function destroyElement(type) {
	document.getElementById('vibinexLogo').remove();
	document.getElementById('floating-info').remove();
	if (type === "loading")
		document.getElementById('vibinexLoadingGif').remove();
	else if (type === "add")
		document.getElementById('vibinexPlusIcon').remove();
	else if (type === "error")
		document.getElementById('vibinexErrorIcon').remove();
}

async function apiCall(url, body) {
	// TODO : doesn't handle multiple api calls on a single page. 
	try {
		createElement("loading")

		let dataFromAPI;
		await fetch(url, {
			method: "POST",
			headers: {
				"Access-Control-Allow-Origin": "chrome-extension://jafgelpkkkopeaefadkdjcmnicgpcncc",
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			body: JSON.stringify(body)
		})
			.then((response) => response.json())
			.then((data) => dataFromAPI = data);

		destroyElement("loading")
		return dataFromAPI;
	} catch (e) {
		console.error(`[vibinex] Error while getting data from API. URL: ${url}, payload: ${JSON.stringify(body)}`, e)
		destroyElement("loading");
		createElement("error");
		setTimeout(() => {
			destroyElement("error");
		}, 2000);
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
async function getTrackedRepos(orgName, userId) {
	const { backendUrl } = await chrome.storage.sync.get(["backendUrl"]);
	const body = { "org": orgName, "userId": userId }
	const url = `${backendUrl}/setup/repos`;
	const trackedRepos = await apiCall(url, body);
	return trackedRepos['repos'];
}

async function updateTrackedReposInOrgGitHub(orgName, websiteUrl, userId) {
	const trackedRepos = await getTrackedRepos(orgName, userId);
	const allOrgRepo = document.getElementById('org-repositories');
	const orgRepoUrl = Array.from(allOrgRepo.getElementsByTagName('a'));

	orgRepoUrl.forEach((item) => {
		const link = item.getAttribute('href').split('/');
		const orgRepoName = link[link.length - 1];

		if (trackedRepos.includes(orgRepoName)) {
			const checkElement = item.getElementsByClassName('trackLogo')[0];
			if (checkElement) {
				// TODO: Ideally, we should only need to add the element when there is none present
				checkElement.remove();
			}
			const img = document.createElement("img");
			img.setAttribute('class', 'trackLogo');
			const beforePsuedoElement = document.createElement('a');
			img.src = `${websiteUrl}/favicon.ico`;
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

function addCssElementToBitbucket(highlightedPRIds) {
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
function getHighlightedPR(highlightedPRIds) {
	if (highlightedPRIds) {
		for (const priorityLevel in highlightedPRIds) {
			for (const prNumber in highlightedPRIds[priorityLevel]) {
				addingCssElementToGithub(prNumber, keyToLabel[priorityLevel], highlightedPRIds[priorityLevel][prNumber]['num_files_changed'])
			}
		}
	}
};

// adding favButton
async function showFloatingActionButton(orgName, orgRepo, userId, websiteUrl) {
	const trackedRepoList = await getTrackedRepos(orgName, userId);
	if (!trackedRepoList.includes(orgRepo)) {
		createElement("add", websiteUrl);
	}
}

// showing the important files in a pr
async function showImpFileInPr(response) {
	if ("relevant" in response) {
		const encryptedFileNames = new Set(response['relevant']);
		const fileNav = document.querySelector('[aria-label="File Tree Navigation"]');
		if (!fileNav) return;
		const fileList = Array.from(fileNav.getElementsByTagName('li'));
		fileList.forEach(async (item) => {
			let elements = item.getElementsByClassName('ActionList-item-label');
			if (elements.length == 1) {
				let filename = elements[0].innerHTML.trim();
				const hashedFilename = await sha256(filename);
				if (encryptedFileNames.has(hashedFilename)) {
					item.style.backgroundColor = '#7a7e00';
				}
			}
		})
	}
}

// highlighting the files in pr for bitbucket 
async function FilesInPrBitbucket(response) {
	let lastKnownScrollPosition = 0;
	let currentScrollPosition = 0;
	let ticking = false;
	document.addEventListener('scroll', () => {
		currentScrollPosition = window.scrollY;
		if (!ticking) {
			window.requestAnimationFrame(() => {
				if (currentScrollPosition - lastKnownScrollPosition > 100) {
					if ("relevant" in response) {
						const encryptedFileNames = new Set(response['relevant']);
						console.log(`[scroll] ticking: ${ticking}; currentScrollPosition: ${currentScrollPosition}, lastKnownScrollPosition: ${lastKnownScrollPosition}`)
						const fileNav = Array.from(document.querySelectorAll("[aria-label^='Diff of file']"))
						lastKnownScrollPosition = currentScrollPosition;
						fileNav.forEach(async (element) => {
							const h3Element = element.querySelector('h3');
							const spanElement = Array.from(h3Element.querySelectorAll('span'));
							const elementHeading = spanElement.length == 1 ? spanElement[0] : spanElement[spanElement.length - 1];
							const spanText = elementHeading.textContent;

							let hashFileName = await sha256(spanText);
							if (encryptedFileNames.includes(hashFileName)) {
								if (spanElement.length == 1) {
									let changeBgColor = element.getElementsByClassName('css-10sfmq2')[0];
									changeBgColor.style.backgroundColor = '#c5cc02';
								} else {
									let value = elementHeading.parentNode.parentNode.parentNode.parentNode.parentNode;
									let value2 = value.children[0];
									value2.style.backgroundColor = '#c5cc02';
								}
							}
						})
					}
				}
				ticking = false;
			});
			ticking = true;
		}
	});
}


const orchestrator = (tab_url, websiteUrl, userId) => {
	console.debug(`[vibinex-orchestrator] updated url: ${tab_url}`);
	let urlObj = tab_url.split('?')[0].split('/');
	if (!userId && (urlObj[2] === 'github.com' || urlObj[2] === 'bitbucket.org')) {
		console.warn(`[Vibinex] You are not logged in. Head to ${websiteUrl} to log in`);
		// TODO: create a UI element on the screen with CTA to login to Vibinex
	}
	chrome.storage.sync.get(["backendUrl"]).then(async ({ backendUrl }) => {
		const owner_name = urlObj[3];
		const repo_name = urlObj[4];
		if (urlObj[2] == 'github.com') {
			if (urlObj[3] && (urlObj[3] !== 'orgs') && urlObj[4]) {
				// for showing fav button if org repo is not added, eg : https://github.com/mui/mui-toolpad
				showFloatingActionButton(owner_name, repo_name, userId, websiteUrl);

				if (urlObj[5] === 'pulls') {
					// show relevant PRs
					const body = {
						"repo_owner": owner_name,
						"repo_name": repo_name,
						"user_id": userId,
						"is_github": true
					}
					const url = `${backendUrl}/relevance/pr`;
					const highlightedPRIds = await apiCall(url, body);
					getHighlightedPR(highlightedPRIds);
				}
				if (urlObj[5] === "pull" && urlObj[6] && urlObj[7] === "files") {
					const pr_number = urlObj[6];
					const body = {
						"repo_owner": owner_name,
						"repo_name": repo_name,
						"user_id": userId,
						"pr_number": pr_number,
						"is_github": true
					}
					const url = `${backendUrl}/relevance/pr/files`;
					let response = await apiCall(url, body);
					showImpFileInPr(response);
				}
			}
			// for showing all tracked repo
			else if (
				(urlObj[3] && urlObj[4] == undefined) ||
				(urlObj[3] == 'orgs' && urlObj[4] && urlObj[5] === 'repositories')) {
				// for woking on this url https://github.com/Alokit-Innovations or https://github.com/orgs/Alokit-Innovations/repositories?type=all type 
				const org_name = (urlObj[3] === "orgs") ? urlObj[4] : urlObj[3];
				updateTrackedReposInOrgGitHub(org_name, websiteUrl, userId);
			}
		}

		if (urlObj[2] === "bitbucket.org" && urlObj[5] === "pull-requests") {

			const body = {
				"repo_owner": owner_name,
				"repo_name": repo_name,
				"user_id": userId,
				"is_github": false
			}
			const url = `${backendUrl}/relevance/pr`;
			let highlightedPRIds = await apiCall(url, body);
			addCssElementToBitbucket(highlightedPRIds);

			if (urlObj[6]) {
				const pr_number = urlObj[6];
				const body = {
					"repo_owner": owner_name,
					"repo_name": repo_name,
					"user_id": userId,
					"pr_number": pr_number,
					"is_github": false
				}
				const url = `${backendUrl}/relevance/pr/files`;
				let response = await apiCall(url, body);
				FilesInPrBitbucket(response);
			}
		}
	})
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