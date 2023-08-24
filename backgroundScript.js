chrome.runtime.onInstalled.addListener(() => {
	const websiteUrl = "https://17b8-171-76-82-43.ngrok-free.app";
	const backendUrl = "https://17b8-171-76-82-43.ngrok-free.app";
	chrome.storage.local.set({ websiteUrl, backendUrl }).then(_ => console.log(`Website URL set to ${websiteUrl};`));

	// API call to backend that created Rudderstack event
	// chrome.storage.local.get(["userId"]).then(({ userId }) => {
	// 	const body = {
	// 		userId: userId ? userId : "anonymous-id",
	// 		function: 'chrome-extension-installed'
	// 	}
	// 	const url = `${backendUrl}/chrome/events`;
	// 	fetch(url, {
	// 		method: "POST",
	// 		headers: {
	// 			"Access-Control-Allow-Origin": "chrome-extension://jafgelpkkkopeaefadkdjcmnicgpcncc",
	// 			"Content-Type": "application/json",
	// 			"Accept": "application/json",
	// 		},
	// 		body: JSON.stringify(body)
	// 	})
	// 		.then((response) => response.json())
	// 		.then((data) => dataFromAPI = data);
	// })
	// chrome.cookies.getAllCookieStores(
	// 	function(stores) {
	// 		console.log("stores = ", stores);
	// 	}
	// );
	// chrome.cookies.getAll({session: true},
	// 	function(cookies) {
	// 		console.log("cookies = ", cookies)
	// 	}
	// );
	// chrome.webRequest.onBeforeRequest.addListener(
	// 	function(details) {
	// 		chrome.cookies.get({ url: web, name: '__Secure-next-auth.session-token' },
	// 			function (cookie) {
	// 				if (cookie) {
	// 					console.log("cookie = ", cookie);
	// 					console.log(cookie.url, cookie.name, cookie.value);
	// 					// chrome.cookies.set({ url: cookie.url, name: cookie.name, value: cookie.value });
	// 				}
	// 				else {
	// 					console.log('Can\'t get cookie! Check the name!');
	// 				}
	// 		})
	// 	    return details;
	// 	},
	// 	{urls: [`${websiteUrl}/**`]},
	// 	[]
	//   );
	// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// 	if (request.action === 'setCookie') {
	// 		chrome.cookies.get({ url: websiteUrl, name: '__Secure-next-auth.session-token' },
	// 			function (cookie) {
	// 				if (cookie) {
	// 					console.log("cookie = ", cookie);
	// 					browser.cookies.set({
	// 						url: "bitbucket.org",
	// 						name: cookie.name,
	// 						value: cookie.value,
	// 					});
	// 				}
	// 				else {
	// 					console.log('Can\'t get cookie! Check the name!');
	// 				}
	// 		})
	// 	}
	// });
	// chrome.cookies.onChanged.addListener(
	// 	function(changeInfo) {
	// 		if (changeInfo && changeInfo.session && changeInfo.cause == "explicit" && changeInfo.cookie.name == "__Secure-next-auth.session-token") {
	// 			chrome.storage.local.set({ "token": changeInfo.cookie.value }).then(() => {
	// 				console.log("Auth token is set");
	// 			});
	// 		}
	// 	}
	// );
})
