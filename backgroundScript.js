chrome.tabs.onUpdated.addListener(
	function (tabId, changeInfo, tab) {
		console.log('running background script')
		if (changeInfo.url) {
			let url = changeInfo.url.split('/');
			if (url[2] == 'github.com' && url[3] && url[4] && url[5]) {
				chrome.tabs.sendMessage(tabId, {
					message: 'githubUrl',
					urls: changeInfo.url,
					repo_owner: url[3],
					repo_name: url[4],
					repo_function: url[5]
				})
			} else if (url[2] === "bitbucket.org" && url[5] === "pull-requests") {
				chrome.tabs.sendMessage(tabId, {
					message: 'bitbucketUrl',
					urls: changeInfo.url
				})
			}
		}
	}
);