/**
 * Fetches the list of tracked repositories for a given organization or user.
 * 
 * @param {string} orgName - The name of the organization or user.
 * @param {string} userId - The ID of the user.
 * @param {string} repoHost - The hosting platform ('github' or 'bitbucket').
 * @returns {Array} - List of tracked repositories.
 */
async function getTrackedRepos(orgName, userId, repoHost) {
	const { websiteUrl } = await chrome.storage.local.get(["websiteUrl"]);
	let body = {};
	let url = ''
	switch (repoHost) {
		case 'github':
			body = { org: orgName, userId: userId, provider: 'github' }
			url = `${websiteUrl}/api/extension/setup`;
			break;
		case 'bitbucket':
			body = { org: orgName, userId: userId, provider: 'bitbucket' }
			url = `${websiteUrl}/api/extension/setup`;
			break;
		default:
			console.warn(`[getTrackedRepos] Invalid repoHost provided: ${repoHost}`);
			break;
	}
	const trackedRepos = await apiCallOnprem(url, body);
	return trackedRepos['repos'];
}

/**
 * Updates the Bitbucket organization page to visually indicate which repositories are being tracked.
 * 
 * @param {Array} trackedRepos - List of tracked repositories.
 * @param {string} websiteUrl - The URL of the website.
 */
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

/**
 * Updates the GitHub organization or user page to visually indicate which repositories are being tracked.
 * 
 * @param {Array} trackedRepos - List of tracked repositories.
 * @param {string} websiteUrl - The URL of the website.
 * @param {boolean} isOrg - Whether github organization or user.
 */
function updateTrackedReposInGitHub(trackedRepos, websiteUrl, ownerType) {
	const allRepo = ownerType == 'org' ? document.getElementById('org-repositories') : document.getElementById('user-repositories-list');
	const repoUrl = Array.from(allRepo.querySelectorAll('a[itemprop="name codeRepository"]'));


	repoUrl.forEach((item) => {
		const link = item.getAttribute('href').split('/');
		const repoName = link[link.length - 1];

		if (trackedRepos.includes(repoName)) {
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
			beforePsuedoElement.href = `${websiteUrl}/repo?repo_name=${repoName}`;
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

/**
 * Displays a floating action button on the repository page if the repository is not being tracked.
 * 
 * @param {string} orgName - The name of the organization or user.
 * @param {string} orgRepo - The name of the repository.
 * @param {string} userId - The ID of the user.
 * @param {string} websiteUrl - The URL of the website.
 * @param {string} repoHost - The hosting platform ('github' or 'bitbucket').
 */
async function showFloatingActionButton(orgName, orgRepo, userId, websiteUrl, repoHost) {
	const trackedRepoList = await getTrackedRepos(orgName, userId, repoHost);
	if (!trackedRepoList.includes(orgRepo)) {
		createElement("add", websiteUrl);
	}
}