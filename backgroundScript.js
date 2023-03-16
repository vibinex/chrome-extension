chrome.tabs.onUpdated.addListener(
	function (tabId, changeInfo, tab) {
		console.log('running background script', tab.status)
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
			// for showing all tracked repo
			else if (url[2] == 'github.com' && url[3]) {

				// for woking on this url https://github.com/Alokit-Innovations type
				if (url[3] && url[4] == undefined) {
					chrome.tabs.sendMessage(tabId, {
						message: 'trackRepo',
						urls: tab.url,
						org_name: url[3],
					})
				}
				// for working on this url https://github.com/orgs/Alokit-Innovations/repositories?type=all type 
				else if(url[3]=='orgs' && url[4]){
					console.log('working on it',url[4])
					chrome.tabs.sendMessage(tabId, {
						message: 'trackRepo',
						urls: tab.url,
						org_name: url[4],
					})
				}


			}
		}
	}
);