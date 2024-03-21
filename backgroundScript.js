// Listener for when the Chrome extension is installed.
chrome.runtime.onInstalled.addListener(() => {
	// Define the environment for the extension, either "prod" or "dev".
	const environment = "prod";
	// const environment = "dev";

	// Set the website and backend URLs based on the environment.
	const websiteUrl = (environment === "dev") ? "http://localhost:3000" : "https://vibinex.com";
	const backendUrl = (environment === "dev") ? "http://localhost:8080" : "https://gcscruncsql-k7jns52mtq-el.a.run.app";

	// Store the website and backend URLs in Chrome's local storage.
	chrome.storage.local.set({ websiteUrl, backendUrl }).then(_ => console.log(`Website URL set to ${websiteUrl};`));

	// Make an API call to the backend to create a Rudderstack event when the extension is installed.
	chrome.storage.local.get(["userId"]).then(({ userId }) => {
		const body = {
			userId: userId ? userId : "anonymous-id", // Use the stored userId or "anonymous-id" if not available.
			function: 'chrome-extension-installed'
		}
		const url = `${websiteUrl}/api/extension/events`;
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

/**
 * Checks Logged in status for showing indicator on supported pages like github and bitbucket.
 * @param {string} websiteUrl
 * @param {string} provider
 * @returns {Promise<boolean>}
 */
async function checkLoginStatus(websiteUrl, provider) {
	let result = false;
	try {
		const res = await fetch(`${websiteUrl}/api/auth/session`, { cache: 'no-store' });
		const json = await res.json();

		if (json.user && json.user.auth_info && json.user.auth_info[provider]) {
			result = true;
		}
	} catch (err) {
		console.error(err);
	}
	return result;
}


/**
 * Listener to handle login status check request.
 * The api session request only works via extension background script due to the need of auth cookies in request.
 */
chrome.runtime.onMessage.addListener(
	function (request, _, sendResponse) {
		const message = JSON.parse(request.message);
		if (message.action === "check_login_status") {
			const websiteUrl = message.websiteUrl;
			const provider = message.provider
			checkLoginStatus(websiteUrl, provider).then(loggedIn => {
				sendResponse({ status: loggedIn });
			});
		}
		return true;  // Will respond asynchronously.
	}
);
