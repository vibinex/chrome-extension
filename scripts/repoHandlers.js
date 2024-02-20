/**
 * Fetches the list of tracked repositories for a given organization or user.
 * 
 * @param {string} orgName - The name of the organization or user.
 * @param {string} userId - The ID of the user.
 * @param {string} repoHost - The hosting platform ('github' or 'bitbucket').
 * @returns {Array} - List of tracked repositories.
 */
async function getTrackedRepos(orgName, userId, repoHost) {
	const { backendUrl } = await chrome.storage.local.get(["backendUrl"]);
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
    const repoList = ownerType == 'org' ? document.querySelectorAll('[data-testid="list-view-items"] > li') : document.querySelectorAll('[data-filterable-for="your-repos-filter"] > li');
    
    repoList.forEach((repoItem) => {
        const repoLink = ownerType == 'org' ? repoItem.querySelector('[data-testid="listitem-title-link"]') : repoItem.querySelector('a[itemprop="name codeRepository"]');
        if (!repoLink) return;

        const repoUrl = repoLink.getAttribute('href');
        const repoName = repoUrl.split('/').pop();

        if (trackedRepos.includes(repoName)) {
            let trackLogo = repoItem.querySelector('.trackLogo');
            if (trackLogo) {
                trackLogo.remove();
            }

            const img = document.createElement("img");
            img.classList.add('trackLogo');
            img.src = `${websiteUrl}/favicon.ico`;
            img.style.width = '15px';
            img.style.height = '15px';

            const link = document.createElement('a');
            link.href = `${websiteUrl}/repo?repo_name=${repoName}`;
            link.target = '_blank';
			link.style.display ='inline-flex';
			link.style.marginRight ='6px';
			link.style.color = 'white';
			link.style.borderRadius = '2px';
			link.style.fontSize = '15px';
			link.style.textDecoration = 'none';
			link.style.alignItems ='center';

            link.appendChild(img);
            repoLink.parentNode.insertBefore(link, repoLink);
        }
    });
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