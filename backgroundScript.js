chrome.tabs.onUpdated.addListener(
	function (tabId, changeInfo, tab) {
		console.log('running background script')
		if (changeInfo.url) {

			let url = changeInfo.url.split('/');

			if (url[2] == 'github.com' && url[3] && url[4] && url[5]) {

				console.log('Sending message', url)

				chrome.tabs.sendMessage(tabId, {
					message: 'urlUpdated',
					urls: changeInfo.url,
					repo_owner: url[3],
					repo_name: url[4],
					repo_function: url[5]
				})
			} else if (url[2] === "bitbucket.org" && url[5] === "pull-requests") {
				console.log('[bitBucket] api calling')
				chrome.tabs.sendMessage(tabId, {
					message: 'bitBucketUrl',
					urls: changeInfo.url
				})
			}
			console.log('updated url is', changeInfo.url, url[3], url[4], url[2])
		}
	}
);