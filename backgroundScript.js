// Listener for when the Chrome extension is installed.
chrome.runtime.onInstalled.addListener(() => {
	// Define the environment for the extension, either "prod" or "dev".
	const environment = "prod";
	// const environment = "dev";

	// Set the website and backend URLs based on the environment.
	const websiteUrl = (environment === "dev") ? "http://localhost:3000" : "https://vibinex.com";
	const backendUrl = (environment === "dev") ? "http://localhost:8080" : "https://gcscruncsql-k7jns52mtq-el.a.run.app";

	// Store the website and backend URLs in Chrome's local storage.
	chrome.storage.local.set({ websiteUrl, backendUrl }, () => {
		if (chrome.runtime.lastError) {
			console.error(`[vibinex] Unable to store websiteUrl, backendUrl in local storage`, chrome.runtime.lastError);
		}
	});
	
	// Make an API call to the backend to create a Rudderstack event when the extension is installed.
	chrome.storage.local.get(["userId"], ({ userId }) => {
		const body = {
			userId: userId ? userId : "anonymous-id", // Use the stored userId or "anonymous-id" if not available.
			function: 'chrome-extension-installed'
		}
		const url = `${backendUrl}/chrome/events`;
		fetch(url, {
				method: "POST",
				headers: {
					"Access-Control-Allow-Origin": "chrome-extension://jafgelpkkkopeaefadkdjcmnicgpcncc",
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				body: JSON.stringify(body)
		}).catch((err) => {
			console.error(`[vibinex/backgroundScript.js]Unable to post installation event to ${url}, error - `, err);
		});
	});
	
	// Trigger content script when url changes on current tab
	chrome.tabs.onUpdated.addListener((tabId, changeInfo, _) => {
		if (changeInfo.url) { // Check if the URL has changed
			console.debug(`[Vibinex] Sending new url - ${changeInfo.url}`)
			// Send a message to the content script in the updated tab
			chrome.tabs.sendMessage(tabId, {
				action: "urlUpdated",
				newUrl: changeInfo.url
			});
		}
	});
})
