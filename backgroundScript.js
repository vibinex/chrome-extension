chrome.runtime.onInstalled.addListener(() => {
	const environment = "prod";
	// const environment = "dev";
	const websiteUrl = (environment === "dev") ? "http://localhost:3000" : "https://vibinex.com";
	const backendUrl = (environment === "dev") ? "http://localhost:8080" : "https://gcscruncsql-k7jns52mtq-el.a.run.app";
	chrome.storage.sync.set({ websiteUrl, backendUrl }).then(_ => console.log(`Website URL set to ${websiteUrl};`));
})

chrome.tabs.onUpdated.addListener(
	function (tabId, changeInfo, tab) {
		chrome.storage.sync.get(["websiteUrl", "userId"]).then(({ websiteUrl, userId }) => {
			if (tab.status === "complete") {
				let url = tab.url.split('?')[0].split('/');
				console.log("[addListener]", url);
				if (url[2] == 'github.com' && url[3] && url[4] && url[5]==="pull" && url[6] && url[7] == 'files') {
					chrome.tabs.sendMessage(tabId, {
						message: 'showImpFileInPR',
						urls: tab.url,
						repo_owner: url[3],
						repo_name: url[4],
						repo_function: url[5],
						userId: userId
					})
				} else if (url[2] == 'github.com' && url[3] && url[4] && url[5]) {
					chrome.tabs.sendMessage(tabId, {
						message: 'trackRepo',
						urls: tab.url,
						org_name: url[3],
					})
				}
				// for working on this url https://github.com/orgs/Alokit-Innovations/repositories?type=all type 
				else if (url[3] == 'orgs' && url[4] && url[5] === 'repositories') {
					chrome.tabs.sendMessage(tabId, {
						message: 'trackRepo',
						urls: tab.url,
						org_name: url[4],
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
					else if (url[3] == 'orgs' && url[4]) {
						chrome.tabs.sendMessage(tabId, {
							message: 'trackRepo',
							urls: tab.url,
							org_name: url[4],
						})
					}
					// for showing fav button if org repo is not added, eg : https://github.com/mui/mui-toolpad
					else if (url[3] && url[4]) {
						chrome.tabs.sendMessage(tabId, {
							message: 'checkRepo',
							urls: tab.url,
							org_name: url[3],
							org_repo: url[4]
						})
					}
				}
			}
		})
	}
);