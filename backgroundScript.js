chrome.runtime.onInstalled.addListener(() => {
	const environment = "prod";
	// const environment = "dev";
	const websiteUrl = (environment === "dev") ? "http://localhost:3000" : "https://vibinex.com";
	const backendUrl = (environment === "dev") ? "http://localhost:8080" : "https://gcscruncsql-k7jns52mtq-el.a.run.app";
	chrome.storage.sync.set({ websiteUrl, backendUrl }).then(_ => console.log(`Website URL set to ${websiteUrl};`));

	// API call to backend that created Rudderstack event
	chrome.storage.sync.get(["userId"]).then(({ userId }) => {
		const body = {
			userId: userId ? userId : "anonymous-id",
			function: 'chrome-extension-installed'
		}
		const url = `${backendUrl}/chrome/events`;
		fetch(url, {
			method: "POST",
			headers: {
				"Access-Control-Allow-Origin": "moz-extension://5c0d342a-6eed-4ac6-a3c2-9d4763cd112a",
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			body: JSON.stringify(body)
		})
			.then((response) => response.json())
			.then((data) => dataFromAPI = data);
	})
})
