console.log('[vibinex] Running content script');
'use strict';

const keyToLabel = Object.freeze({
	'relevant': "Relevant",
	'important': "Important"
});

const GH_RELEVANT_BG_COLOR = "rgb(86, 88, 0)";

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
	img.style.zIndex = '200';

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
		redirectLink.href = `${websiteUrl}/docs`;
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
				"Access-Control-Allow-Origin": "moz-extension://5c0d342a-6eed-4ac6-a3c2-9d4763cd112a",
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
async function getTrackedRepos(orgName, userId, repoHost) {
	const { backendUrl } = await chrome.storage.sync.get(["backendUrl"]);
	let body = {};
	let url = ''
	switch (repoHost) {
		case 'github':
			body = { org: orgName, userId: userId, is_github: true }
			url = `${backendUrl}/github/setup/repos`;
			break;
		case 'bitbucket':
			body = { workspace_slug: orgName, userId: userId, is_github: false }
			url = `${backendUrl}/bitbucket/setup/repos`;
			break;
		default:
			console.warn(`[getTrackedRepos] Invalid repoHost provided: ${repoHost}`);
			break;
	}
	const trackedRepos = await apiCall(url, body);
	return trackedRepos['repos'];
}

function updateTrackedReposInBitbucketOrg(trackedRepos, websiteUrl) {
	const tbody = document.querySelector('tbody');
	const trs = tbody.querySelectorAll('td');

	trs.forEach((item) => {
		const text = Array.from(item.getElementsByTagName('a'));
		if (text.length >= 2 && trackedRepos.includes(text[1].innerHTML)) {
			const img = document.createElement("img");
			img.setAttribute('class', 'trackLogo');
			const beforePsuedoElement = document.createElement('a');
			img.src = `${websiteUrl}/favicon.ico`;
			img.style.width = '15px'
			img.style.height = '15px'
			img.style.marginBottom = '-3px'
			img.style.marginRight = '3px'

			beforePsuedoElement.appendChild(img);
			beforePsuedoElement.href = `${websiteUrl}/repo?repo_name=${text[1].innerHTML}`;
			beforePsuedoElement.target = '_blank';
			beforePsuedoElement.style.display = 'inline-block';
			beforePsuedoElement.style.marginRight = '2px';
			beforePsuedoElement.style.color = 'white';
			beforePsuedoElement.style.borderRadius = '2px';
			beforePsuedoElement.style.fontSize = '15px';
			beforePsuedoElement.style.textDecoration = 'none';
			text[1].insertBefore(beforePsuedoElement, text[1].firstChild)
		}

	});
}

function updateTrackedReposInOrgGitHub(trackedRepos, websiteUrl) {
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

function addingCssElementToGithub(elementId, status, changeInfo) {
	const backgroundColor = status == 'Important' ? 'rgb(61, 0, 0)' : GH_RELEVANT_BG_COLOR;
	const tagBackgroundColor = status == 'Important' ? 'rgb(255,0,0)' : 'rgb(164, 167, 0)';
	const rowElement = document.getElementById(`issue_${elementId}`);
	if (rowElement && rowElement != null) {
		rowElement.style.backgroundColor = backgroundColor;
		const element = document.head.appendChild(document.createElement("style"));
		// TODO: a better approach would be create a constant CSS for a class, and add the class to the elements in consideration
		element.innerHTML = `#issue_${elementId}_link::before{
		background-color:${tagBackgroundColor};
		content: '${changeInfo['num_hunks_changed']} change${parseInt(changeInfo['num_hunks_changed']) == 1 ? '' : 's'}';
		color: white;
		width: 12px;
		height: 12px;
		border: rgb(45, 0, 0);
		border-radius: 5px;
		margin-right: 10px;
		padding-left: 5px;
		padding-right: 5px;
		padding-bottom: 2px;}`;
	}
};

function addCssElementToBitbucket(highlightedPRIds) {
	const tables = document.getElementsByTagName('table')[0];
	const allLinks = Array.from(tables.getElementsByTagName('a'));

	function changingCss(id, status, changeInfo) {
		const backgroundColor = status == 'Important' ? 'rgb(255, 186, 181)' : 'rgb(241, 245, 73)';
		const tagBackgroundColor = status == 'Important' ? 'rgb(232, 15, 0)' : 'rgb(164, 167, 0)';
		allLinks.forEach((item) => {
			const link = item.getAttribute('href').split('/');
			const prId = link[link.length - 1]; // getting the last element from url which is pr id. 
			if (prId == id) {
				const beforePsuedoElement = document.createElement('span');
				beforePsuedoElement.innerText = `${status} (${changeInfo['num_hunks_changed']})`;
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
			changingCss(prNumber, keyToLabel[priorityLevel], highlightedPRIds[priorityLevel][prNumber]);
		}
	}
}

// adding css elements based up the data getting from api
function highlightRelevantPRs(highlightedPRIds) {
	if (highlightedPRIds) {
		for (const priorityLevel in highlightedPRIds) {
			for (const prNumber in highlightedPRIds[priorityLevel]) {
				addingCssElementToGithub(prNumber, keyToLabel[priorityLevel], highlightedPRIds[priorityLevel][prNumber])
			}
		}
	}
};

// adding favButton
async function showFloatingActionButton(orgName, orgRepo, userId, websiteUrl, repoHost) {
	const trackedRepoList = await getTrackedRepos(orgName, userId, repoHost);
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

		for (const item of fileList) {
			const elements = item.getElementsByClassName('ActionList-item-label');
			if (elements.length === 1) {
				let filename = elements[0].innerHTML.trim();
				let element = elements[0];
				let anc = element.closest("ul");
				while (anc !== null) {
					for (const child of anc.parentElement.childNodes) {
						if (child.nodeName.toLowerCase() === "button") {
							let folders = child.getElementsByClassName('ActionList-item-label');
							if (folders.length === 1) {
								const folderName = folders[0].innerHTML.trim();
								filename = `${folderName}/${filename}`;
							}
						}
					}
					element = anc.parentElement;
					anc = element.closest("ul");
				}
				const hashedFilename = await sha256(filename);
				if (encryptedFileNames.has(hashedFilename)) {
					item.style.backgroundColor = '#7a7e00';
				}
			}
		}
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
						const fileNav = Array.from(document.querySelectorAll("[aria-label^='Diff of file']"))
						lastKnownScrollPosition = currentScrollPosition;
						fileNav.forEach(async (element) => {
							const h3Element = element.querySelector('h3');
							const spanElement = Array.from(h3Element.querySelectorAll('span'));
							const elementHeading = spanElement.length == 1 ? spanElement[0] : spanElement[spanElement.length - 1];
							const spanText = elementHeading.textContent;

							const hashFileName = await sha256(spanText);
							if (encryptedFileNames.has(hashFileName)) {
								if (spanElement.length == 1) {
									const changeBgColor = element.getElementsByClassName('css-10sfmq2')[0];
									changeBgColor.style.backgroundColor = '#c5cc02';
								} else {
									const value = elementHeading.parentNode.parentNode.parentNode.parentNode.parentNode;
									const value2 = value.children[0];
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

const githubHunkHighlight = async (apiResponses) => {
	// TODO: optimization needed to not highlight next deleted line space if not present in response.
	const getFileName = Array.from(document.querySelectorAll('div[data-tagsearch-path]'));
	getFileName.forEach(async (item) => {
		let fileContent = item.getAttribute('data-tagsearch-path');
		if (fileContent) {

			const matchEncrypted = await sha256(fileContent);
			const foundFiles = apiResponses["hunkinfo"].filter(item => item.file === matchEncrypted);

			if (foundFiles.length >= 0) {
				// checking for diff view either unified or split 
				// TODO: We can identify the view once for all files at once instead of doing it for each file separately
				const deletedLines = document.querySelectorAll('input[value]');
				let diffView = false;
				deletedLines.forEach((item) => {
					const getValue = item.getAttribute('value');
					const getName = item.getAttribute('checked');

					if (getValue == 'unified' || getValue == 'split') {
						if (getName == 'checked' && getValue == 'unified') {
							diffView = true; // for unified view
						}

					}

				});

				const value = Array.from(item.getElementsByTagName('tr'));

				if (diffView) {
					// for unified view
					let flag = false;
					value.forEach((item, index) => {
						const deletedLines = item.querySelector('button[data-original-line]')
						if (deletedLines !== null) {
							const originalLine = deletedLines.getAttribute('data-original-line');
							const signature = originalLine.charAt(0);
							const tableNumber = item.querySelector('td[data-line-number]');
							const checkNumber = tableNumber.getAttribute('data-line-number');
							for (const foundFile of foundFiles) {
								if ((signature == '-' || signature == '+') && checkNumber >= foundFile.line_start && checkNumber <= foundFile.line_end) {
									flag = true;
								} else {
									flag = false;
								}

								if (flag) {
									item.style.backgroundColor = GH_RELEVANT_BG_COLOR;
								}
							}
						}
					});

				} else {
					// for split view 
					value.forEach((items) => {
						const secondRow = Array.from(items.getElementsByTagName('td'));
						secondRow.forEach((item) => {
							const buttonId = item.querySelector('button[data-line]');
							if (buttonId) {
								const dataLineValue = buttonId.getAttribute('data-line');
								const tableContent = items.querySelector("td[data-split-side='left']");
								if ((tableContent.innerHTML === '') || (tableContent && tableContent.querySelector("span[data-code-marker='-']"))) {
									for (const foundFile of foundFiles) {
										if (dataLineValue >= foundFile.line_start && dataLineValue <= foundFile.line_end) {
											items.style.backgroundColor = GH_RELEVANT_BG_COLOR;
										}
									}
								}
							}
						})
					})
				}
			}
		}
	})
}

const bitBucketHunkHighlight = (apiResponses) => {
	let lastKnownScrollPosition = 0;
	let currentScrollPosition = 0;
	let ticking = false;
	document.addEventListener('scroll', () => {
		currentScrollPosition = window.scrollY;
		if (!ticking) {
			window.requestAnimationFrame(() => {
				if (currentScrollPosition - lastKnownScrollPosition > 100) {

					const articles = document.querySelectorAll('article[aria-label^="Diff of file"]');
					articles.forEach(async (article) => {
						const ariaLabel = article.getAttribute('aria-label');
						const fileName = ariaLabel.substring(13); // beacuse ariaLable = "Diff of file testFile.js", so removing first 13 letters to get the file name

						const matchEncrypted = await sha256(fileName);
						const foundFiles = apiResponses["hunkinfo"].find(item => item.file === matchEncrypted);

						if (foundFiles) {
							const fileHighlight = article.firstElementChild;
							const headingHighlight = fileHighlight.children[0];
							headingHighlight.style.backgroundColor = '#f1f549'; // highlight file Head

							// getting the status of file 
							const status = article.querySelector('div[class^="diff-chunk-inner"]');
							const statusDetail = status.classList;

							const listOfChunks = article.getElementsByClassName('diff-chunk-inner');
							const allChunkLines = listOfChunks[0].querySelectorAll('.lines-wrapper');

							const lineStart = parseInt(foundFiles.line_start);
							const lineEnd = parseInt(foundFiles.line_end);

							function getLineNumber(element) {
								const lineNumberElement = element.querySelector('a[aria-label]');
								const getLineNumber = lineNumberElement.getAttribute('aria-label');
								const lineNumber = parseInt(getLineNumber.match(/\d+/)[0]); // for getting the number from text (for example : 'xyz abc 12' gives 12)
								return lineNumber;
							}

							if (statusDetail[1] == 'side-by-side') {
								// for split view 
								allChunkLines.forEach((item) => {
									const scanEachLine = item.querySelectorAll('span[data-line-type]');

									scanEachLine.forEach((line) => {
										const symbol = line.getAttribute('data-line-type');

										if (symbol == '-') {
											const lineNumber = getLineNumber(item);
											if (lineNumber >= lineStart && lineNumber <= lineEnd) {
												const firstElement = item.firstElementChild;
												const secondChild = firstElement.children[2];
												secondChild.style.borderLeft = 'solid 6px #f1f549';
											}
										} else if (symbol == '+') {
											const lineNumber = getLineNumber(item);
											if (lineNumber >= lineStart && lineNumber <= lineEnd) {
												const secondElement = item.children[1];
												const secondChild = secondElement.children[2];
												secondChild.style.borderLeft = 'solid 6px #f1f549';
											}
										}
									})

								})

							} else {
								// for unified view 
								allChunkLines.forEach((item) => {
									const eachLine = item.querySelector('span[data-line-type]');
									const symbol = eachLine.getAttribute('data-line-type');

									if (symbol == '-' || symbol == '+') {
										const lineNumber = getLineNumber(item);
										if (lineNumber >= lineStart && lineNumber <= lineEnd) {
											const firstElement = item.firstElementChild;
											const secondChild = firstElement.children[2];
											secondChild.style.borderLeft = 'solid 6px #f1f549';
										}
									}
								})
							}
						}
					});
				}
				ticking = false;
			});
			ticking = true;
		}
	});




}


const orchestrator = (tabUrl, websiteUrl, userId) => {
	console.debug(`[vibinex-orchestrator] updated url: ${tabUrl}`);
	const urlObj = tabUrl.split('?')[0].split('/');
	if (!userId && (urlObj[2] === 'github.com' || urlObj[2] === 'bitbucket.org')) {
		console.warn(`[Vibinex] You are not logged in. Head to ${websiteUrl} to log in`);
		// TODO: create a UI element on the screen with CTA to login to Vibinex
	}
	chrome.storage.sync.get(["backendUrl"]).then(async ({ backendUrl }) => {
		if (urlObj[2] == 'github.com') {
			if (urlObj[3] && (urlObj[3] !== 'orgs') && urlObj[4]) {
				// for showing fav button if org repo is not added, eg : https://github.com/mui/mui-toolpad
				const ownerName = urlObj[3];
				const repoName = urlObj[4];
				showFloatingActionButton(ownerName, repoName, userId, websiteUrl, 'github');

				if (urlObj[5] === 'pulls') {
					// show relevant PRs
					const body = {
						"repo_owner": ownerName,
						"repo_name": repoName,
						"user_id": userId,
						"is_github": true
					}
					const url = `${backendUrl}/relevance/pr`;
					const highlightedPRIds = await apiCall(url, body);
					highlightRelevantPRs(highlightedPRIds);
				}
				if (urlObj[5] === "pull" && urlObj[6] && urlObj[7] === "files") {
					const prNumber = parseInt(urlObj[6]);
					const body = {
						"repo_owner": ownerName,
						"repo_name": repoName,
						"user_id": userId,
						"pr_number": prNumber,
						"is_github": true
					}
					const url = `${backendUrl}/relevance/pr/files`;
					const response = await apiCall(url, body);
					showImpFileInPr(response);

					const hunk_info_body = {
						"repo_owner": ownerName,
						"repo_name": repoName,
						"user_id": userId,
						"pr_number": prNumber,
						"repo_provider": "github"
					}
					const hunk_info_url = `${backendUrl}/relevance/hunkinfo`;
					const hunk_info_response = await apiCall(hunk_info_url, hunk_info_body);
					githubHunkHighlight(hunk_info_response);
				}
			}
			// for showing all tracked repo
			else if (
				(urlObj[3] && urlObj[4] == undefined) ||
				(urlObj[3] == 'orgs' && urlObj[4] && urlObj[5] === 'repositories')) {
				// for woking on this url https://github.com/Alokit-Innovations or https://github.com/orgs/Alokit-Innovations/repositories?type=all type 
				const orgName = (urlObj[3] === "orgs") ? urlObj[4] : urlObj[3];
				const trackedRepos = await getTrackedRepos(orgName, userId, 'github')
				updateTrackedReposInOrgGitHub(trackedRepos, websiteUrl);
			}
		}

		if (urlObj[2] === 'bitbucket.org') {
			// for showing tracked repo of a organization 
			if (urlObj[4] === 'workspace' && urlObj[5] === 'repositories') {
				const workspaceSlug = urlObj[3];
				const trackedRepos = await getTrackedRepos(workspaceSlug, userId, 'bitbucket')
				updateTrackedReposInBitbucketOrg(trackedRepos, websiteUrl);
			}

			if (urlObj[5] === "pull-requests") {
				const ownerName = urlObj[3];
				const repoName = urlObj[4];
				// for showing tracked pr of a repo 
				if (!urlObj[6]) {
					const body = {
						"repo_owner": ownerName,
						"repo_name": repoName,
						"user_id": userId,
						"is_github": false
					}
					const url = `${backendUrl}/relevance/pr`;
					const highlightedPRIds = await apiCall(url, body);
					addCssElementToBitbucket(highlightedPRIds);
				}
				// for showing highlighted file in single pr and also for hunkLevel highlight 
				else if (urlObj[6]) {
					const prNumber = parseInt(urlObj[6]);
					const body = {
						"repo_owner": ownerName,
						"repo_name": repoName,
						"user_id": userId,
						"pr_number": prNumber,
						"repo_provider": 'bitbucket',
						"is_github": false
					}
					const url = `${backendUrl}/relevance/pr/files`;
					const response = await apiCall(url, body);
					FilesInPrBitbucket(response);
					// for hunk level high light of each file 
					const hunkUrl = `${backendUrl}/relevance/hunkinfo`;
					const hunkResponse = await apiCall(hunkUrl, body);
					bitBucketHunkHighlight(hunkResponse);
				}
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
