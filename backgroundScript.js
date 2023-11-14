// Listener for when the Chrome extension is installed.
chrome.runtime.onInstalled.addListener(() => {
	// Define the environment for the extension, either "prod" or "dev".
	// const environment = "prod";
	const environment = "dev";

	// Set the website and backend URLs based on the environment.
	const websiteUrl = (environment === "dev") ? "https://vibi-test-394606.el.r.appspot.com" : "https://vibinex.com";
	const backendUrl = (environment === "dev") ? "https://gcscruncsql-k7jns52mtq-el.a.run.app" : "https://gcscruncsql-k7jns52mtq-el.a.run.app";

	// Store the website and backend URLs in Chrome's local storage.
	chrome.storage.local.set({ websiteUrl, backendUrl }).then(_ => console.log(`Website URL set to ${websiteUrl};`));

	// Make an API call to the backend to create a Rudderstack event when the extension is installed.
	chrome.storage.local.get(["userId"]).then(({ userId }) => {
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
		})
			.then((response) => response.json())
			.then((data) => dataFromAPI = data); // Store the response data in the dataFromAPI variable.
	})
})
