chrome.runtime.onInstalled.addListener(() => {
	// const environment = "prod";
	const environment = "dev";
	const websiteUrl = (environment == "dev") ? "http://localhost:3000" : "https://vibinex.com";
	chrome.storage.sync.set({ websiteUrl }).then(_ => console.log(`Website URL set to ${websiteUrl}`))
})

chrome.tabs.onUpdated.addListener(
	function (tabId, changeInfo, tab) {
		chrome.storage.sync.get(["websiteUrl", "userId"]).then(({ websiteUrl, userId }) => {
			if (tab.status === "complete") {
				console.log('running background script');
				let url = tab.url.split('/');
				if (url[2] == 'github.com' && url[3] && url[4] && url[5]) {
					chrome.tabs.sendMessage(tabId, {
						message: 'githubUrl',
						urls: tab.url,
						repo_owner: url[3],
						repo_name: url[4],
						repo_function: url[5],
						userId: userId
					})
				} else if (url[2] === "bitbucket.org" && url[5] === "pull-requests") {
					chrome.tabs.sendMessage(tabId, {
						message: 'bitbucketUrl',
						urls: tab.url,
						userId: userId
					})
				}
			}
		});
	}
);