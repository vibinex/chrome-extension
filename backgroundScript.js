chrome.tabs.onUpdated.addListener(
	function (tabId, changeInfo, tab) {
		console.log('running background script',tab.status)
		if (tab.status == 'complete') {
			let url = tab.url.split('/');
			if (url[2] == 'github.com' && url[3] && url[4] && url[5]) {
				chrome.tabs.sendMessage(tabId, {
					message: 'githubUrl',
					urls: tab.url,
					repo_owner: url[3],
					repo_name: url[4],
					repo_function: url[5]
				})
			} else if (url[2] === "bitbucket.org" && url[5] === "pull-requests") {
				chrome.tabs.sendMessage(tabId, {
					message: 'bitbucketUrl',
					urls: tab.url
				})
			}
		}
	}
);