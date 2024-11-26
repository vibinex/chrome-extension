/**
 * The `orchestrator` function is responsible for orchestrating various actions based on the current URL of the tab.
 *
 * Functionality:
 * 1. Logs the updated tab URL for debugging purposes.
 * 2. Checks if the user is logged in when on GitHub or Bitbucket. If not, a warning is displayed.
 * 3. Retrieves the 'websiteUrl' from Chrome local storage.
 *
 * For GitHub:
 * - If on a specific repository page (e.g., https://github.com/mui/mui-toolpad), it displays a floating action button.
 * - If on a repository's pull requests page, it highlights relevant PRs.
 * - If viewing files of a specific pull request, it highlights important files and specific code hunks.
 * - If on a user or organization's main page or repositories page, it updates the display of tracked repositories.
 *
 * For Bitbucket:
 * - If on a workspace's repositories page, it updates the display of tracked repositories.
 * - If on a repository's pull requests page, it highlights relevant PRs or specific files and code hunks in a PR.
 *
 * Note: This function assumes it's running in the context of a browser extension, given its use of the 'chrome.storage' API and specific URL patterns for GitHub and Bitbucket.
 */
const orchestrator = async (tabUrl, websiteUrl, userId) => {
	console.debug(`[vibinex-orchestrator] updated url: ${tabUrl}`);
	const urlObj = tabUrl.split('?')[0].split('/');
	const urlEnd = tabUrl.split('?')[1];
	// for a possible case like https://github.com/AJAYK-01?tab=repositories&success=true
	const searchParams = urlEnd !== undefined ? urlEnd.split('&') : [];

	const relevanceApiUrl = `${websiteUrl}/api/extension/relevant`;

	if (!userId && (urlObj[2] === 'github.com' || urlObj[2] === 'bitbucket.org')) {
		console.warn(`[Vibinex] You are not logged in. Head to ${websiteUrl} to log in`);
	}
	if (urlObj[2] == 'github.com') {
		await orchestrateGitHubUrls(userId, urlObj, searchParams, websiteUrl, relevanceApiUrl);
	}

	if (urlObj[2] === 'bitbucket.org') {
		await orchestrateBitbucketUrls(userId, urlObj, searchParams, websiteUrl, relevanceApiUrl);
	}
};

const orchestrateGitHubUrls = async (userId, urlObj, searchParams, websiteUrl, relevanceApiUrl) => {
	const githubReservedPages = ['sessions', 'login'];
	if (urlObj[3] && githubReservedPages.includes(urlObj[3])) {
		return;
	}
	const isDark = getThemeColor().every((color) => color < 128);
	addSignedOutIndicator(websiteUrl, 'github');
	if (urlObj[3] && (urlObj[3] !== 'orgs') && urlObj[4]) {
		// for showing fav button if org repo is not added, eg : https://github.com/mui/mui-toolpad
		await handleGitHubRepoUrls(userId, urlObj, searchParams, websiteUrl, relevanceApiUrl, isDark);
	}
	// for showing all tracked repo in organisation page
	else if (
		(urlObj[3] && urlObj[4] == undefined && !searchParams.includes('tab=repositories')) ||
		(urlObj[3] == 'orgs' && urlObj[4] && urlObj[5] === 'repositories')) {
		// for working on this url https://github.com/vibinex or https://github.com/orgs/vibinex/repositories?type=all type
		const orgName = (urlObj[3] === "orgs") ? urlObj[4] : urlObj[3];
		const trackedRepos = await getTrackedRepos(orgName, userId, 'github');
		updateTrackedReposInGitHub(trackedRepos, websiteUrl, 'org');
	}
	// for showing all tracked repo in user page
	else if (urlObj[3] && !urlObj[4] && searchParams.includes('tab=repositories')) {
		// for working on this url https://github.com/username?tab=repositories
		const userName = urlObj[3];
		const trackedRepos = await getTrackedRepos(userName, userId, 'github');
		updateTrackedReposInGitHub(trackedRepos, websiteUrl, 'user');
	}
};

const handleGitHubRepoUrls = async (userId, urlObj, searchParams, websiteUrl, relevanceApiUrl, isDark) => {
	const ownerName = urlObj[3];
	const repoName = urlObj[4];
	showFloatingActionButton(ownerName, repoName, userId, websiteUrl, 'github');

	if (urlObj[5] === 'pulls') {
		// show relevant PRs
		const body = {
			"repo_owner": ownerName,
			"repo_name": repoName,
			"user_id": userId,
			"repo_provider": "github"
		};
		const query_params = { type: "review" };
		const highlightedPRIds = await apiCallOnprem(relevanceApiUrl, body, query_params);
		highlightRelevantPRs(highlightedPRIds, isDark);
	}

	let triggerBtnMutationObserver;
	if (urlObj[5] === "pull" && urlObj[6] && !Number.isNaN(parseInt(urlObj[6]))) {
		// show trigger button on pull request page
		const prNumber = parseInt(urlObj[6]);
		const ownerName = urlObj[3];
		const repoName = urlObj[4];
		const prUrl = `https://github.com/${ownerName}/${repoName}/pull/${prNumber}`;

		addDiffGraphPanel(websiteUrl, ownerName, repoName, prNumber);

		// Initial attempt to add the button
		addTriggerButton('github', prUrl, websiteUrl);

		// Set up a MutationObserver to watch for changes in the DOM
		if (triggerBtnMutationObserver) {
			triggerBtnMutationObserver.disconnect();
		}
		triggerBtnMutationObserver = new MutationObserver(() => addTriggerButton('github', prUrl, websiteUrl));
		triggerBtnMutationObserver.observe(document.body, { childList: true, subtree: true });
	} else if (triggerBtnMutationObserver) {
		triggerBtnMutationObserver.disconnect();
		triggerBtnMutationObserver = null;
	}

	if (urlObj[5] === "pull" && urlObj[6] && !Number.isNaN(parseInt(urlObj[6])) && !urlObj[7]) {
		const prNumber = parseInt(urlObj[6]);
		// Read through the comments in the conversation
		const comments = document.querySelectorAll('.js-comment-body');
		// Extract the one that has a Mermaid code block in it
		let mermaidCode;
		comments.forEach(comment => {
			const rawCommentValue = comment.textContent;
			if (rawCommentValue && rawCommentValue.includes('flowchart')) {
				mermaidCode = rawCommentValue;
			}
		});
		sessionStorage.setItem(`mermaidCode-${ownerName}-${repoName}-${prNumber}`, mermaidCode);
	}

	if (urlObj[5] === "pull" && urlObj[6] && !Number.isNaN(parseInt(urlObj[6])) && urlObj[7] && urlObj[7].startsWith('files')) {
		const prNumber = parseInt(urlObj[6]);
		const body = {
			"repo_owner": ownerName,
			"repo_name": repoName,
			"user_id": userId,
			"pr_number": prNumber,
			"repo_provider": 'github'
		};
		let query_params = { type: "file" };
		const response = await apiCallOnprem(relevanceApiUrl, body, query_params);
		showImpFileInPr(response, isDark);

		query_params = { type: "hunk" };
		const hunk_info_response = await apiCallOnprem(relevanceApiUrl, body, query_params);
		githubHunkHighlight(hunk_info_response, isDark);
	}
};

const orchestrateBitbucketUrls = async (userId, urlObj, searchParams, websiteUrl, relevanceApiUrl) => {
	addSignedOutIndicator(websiteUrl, 'bitbucket');
	// for showing tracked repo of a organization
	if (urlObj[4] === 'workspace' && urlObj[5] === 'repositories') {
		const workspaceSlug = urlObj[3];
		const trackedRepos = await getTrackedRepos(workspaceSlug, userId, 'bitbucket');
		updateTrackedReposInBitbucketOrg(trackedRepos, websiteUrl);
	}

	let triggerBtnMutationObserver;
	if (urlObj[5] === "pull-requests") {
		const ownerName = urlObj[3];
		const repoName = urlObj[4];
		// for showing tracked pr of a repo
		if (!urlObj[6]) {
			const body = {
				"repo_owner": ownerName,
				"repo_name": repoName,
				"user_id": userId,
				"repo_provider": "bitbucket"
			};
			const query_params = { type: "review" };
			const highlightedPRIds = await apiCallOnprem(relevanceApiUrl, body, query_params);
			addCssElementToBitbucket(highlightedPRIds);

			if (triggerBtnMutationObserver) {
				triggerBtnMutationObserver.disconnect();
				triggerBtnMutationObserver = null;
			}
		}
		// for showing highlighted file in single pr and also for hunkLevel highlight
		else if (urlObj[6]) {
			const prNumber = parseInt(urlObj[6]);
			// show trigger button on pull request page
			const prUrl = `https://bitbucket.org/${ownerName}/${repoName}/pull-requests/${prNumber}`;
			addTriggerButton('bitbucket', prUrl, websiteUrl);

			if (triggerBtnMutationObserver) {
				triggerBtnMutationObserver.disconnect();
			}
			const triggerBtnMutationObserver = new MutationObserver(() => addTriggerButton('bitbucket', prUrl, websiteUrl));
			triggerBtnMutationObserver.observe(document.body, { childList: true, subtree: true });

			// file and hunk highlighting
			const body = {
				"repo_owner": ownerName,
				"repo_name": repoName,
				"user_id": userId,
				"pr_number": prNumber,
				"repo_provider": 'bitbucket'
			};
			let query_params = { type: "file" };
			const response = await apiCallOnprem(relevanceApiUrl, body, query_params);
			FilesInPrBitbucket(response);
			// for hunk level high light of each file
			query_params = { type: "hunk" };
			const hunkResponse = await apiCallOnprem(relevanceApiUrl, body, query_params);
			bitBucketHunkHighlight(hunkResponse);
		}
	}
};

const getThemeColor = () => {
	const bgColor = window.getComputedStyle(document.body).getPropertyValue('background-color');

	// Extract R, G, B values
	const match = /rgb\((\d+), (\d+), (\d+)\)/.exec(bgColor);

	if (!match) {
		console.error(`Unexpected background color format: ${bgColor}`);
		return [255, 255, 255]; // Default to white or any sensible default
	}

	// Convert to numbers
	const r = parseInt(match[1]);
	const g = parseInt(match[2]);
	const b = parseInt(match[3]);

	// Put in array
	const bgRGB = [r, g, b];
	return bgRGB;
};

const addDiffGraphPanel = (websiteUrl, ownerName, repoName, prNumber) => {
	const panelBackgroundColor = 'beige';
	const vibinexLogo = document.createElement("img");
	vibinexLogo.src = `${websiteUrl}/favicon.ico`;
	vibinexLogo.style.width = '30px';
	vibinexLogo.style.verticalAlign = 'middle';

	const panelButton = document.createElement('button');
	panelButton.style.position = 'fixed';
	panelButton.style.left = '0px';
	panelButton.style.top = '50%';
	panelButton.style.zIndex = '1000';
	panelButton.appendChild(vibinexLogo);
	panelButton.style.backgroundColor = 'black';
	panelButton.style.borderTopRightRadius = '20px';
	panelButton.style.borderBottomRightRadius = '20px';

	// Preventing the default drag behavior
	panelButton.ondragstart = (e) => {
		e.preventDefault();
	};

	panelButton.onmousedown = (e) => {
		e.preventDefault();
		const startTop = e.pageY;
		const startHeight = panelButton.getBoundingClientRect().height / 2;
		document.onmousemove = (moveEvent) => {
			const newTop = moveEvent.pageY - startHeight;
			// Ensuring the button does not go beyond the top of the viewport
			if (newTop > 0) {
				panelButton.style.top = newTop + 'px';
				// Adjusting the closeButton position to match the panelButton
				closeButton.style.top = newTop + 'px';
			}
		};
		document.onmouseup = () => {
			document.onmousemove = null;
			document.onmouseup = null;
		};
	};
	document.body.appendChild(panelButton);

	const panel = document.createElement('div');
	panel.style.position = 'fixed';
	panel.style.left = '0';
	panel.style.top = '0';
	panel.style.height = '100vh';
	panel.style.width = '33.33%';
	panel.style.backgroundColor = panelBackgroundColor;
	panel.style.zIndex = '1000';
	panel.style.display = 'none';
	panel.style.borderTopRightRadius = '20px';
	panel.style.borderBottomRightRadius = '20px';
	panel.style.padding = '10px';
	panel.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
	panel.style.transition = 'all 0.3s ease-in-out';
	document.body.appendChild(panel);

	const closeButton = document.createElement('button');
	closeButton.textContent = 'X';
	closeButton.style.position = 'absolute';
	closeButton.style.top = '50%';
	closeButton.style.left = '100%';
	closeButton.style.zIndex = '1001';
	closeButton.style.cursor = 'pointer';
	closeButton.style.backgroundColor = panelBackgroundColor;
	closeButton.style.border = 'none';
	closeButton.style.padding = '10px 15px';
	closeButton.style.borderTopRightRadius = '20px';
	closeButton.style.borderBottomRightRadius = '20px';
	closeButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
	panel.appendChild(closeButton);

	panelButton.addEventListener('click', () => {
		panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
		if (panel.style.display === 'block') {
			const loader = document.createElement('div');
			loader.textContent = 'Loading...';
			panel.appendChild(loader);

			const mermaidCode = sessionStorage.getItem(`mermaidCode-${ownerName}-${repoName}-${prNumber}`);

			const graphContainer = document.createElement('div');
			if (!mermaidCode) {
				graphContainer.textContent = 'No DiffGraph to display';
			} else {
				graphContainer.innerHTML = `<div class="mermaid">${mermaidCode}</div>`;
			}
			panel.removeChild(loader); // Remove the loader once the graph is loaded
			panel.appendChild(graphContainer);
		}
	});

	closeButton.addEventListener('click', () => {
		panel.style.display = 'none';
	});
}