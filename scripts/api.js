/**
 * Makes an API call to the provided URL with the given body.
 * 
 * @param {string} url - The endpoint URL for the API call.
 * @param {Object} body - The payload to be sent in the request body.
 * @returns {Object} - The data returned from the API.
 */
async function apiCall(url, body) {
	// TODO : doesn't handle multiple api calls on a single page. 
	try {
		createElement("loading")

		let dataFromAPI;
		await fetch(url, {
			method: "POST",
			headers: {
				"Access-Control-Allow-Origin": "chrome-extension://jafgelpkkkopeaefadkdjcmnicgpcncc",
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			body: JSON.stringify(body)
		})
			.then((response) => response.json())
			.then((data) => dataFromAPI = data);

		destroyElement("loading")
		return dataFromAPI;
	} catch (e) {
		console.error(`[vibinex] Error while getting data from API. URL: ${url}, payload: ${JSON.stringify(body)}`, e)
		destroyElement("loading");
		createElement("error");
		setTimeout(() => {
			destroyElement("error");
		}, 2000);
	}
}

/**
 * Makes an on-premises API call to the provided URL with the given body and query parameters.
 * 
 * @param {string} url - The endpoint URL for the API call.
 * @param {Object} body - The payload to be sent in the request body.
 * @param {Object} query_params - The query parameters to be appended to the URL.
 * @returns {Object} - The data returned from the API.
 */
async function apiCallOnprem(url, body, query_params={}) {
	// TODO : doesn't handle multiple api calls on a single page.
	if (query_params) {
		const queryString = new URLSearchParams(query_params).toString();
		url = `${url}?${queryString}`;
	}
	createElement("loading");
	const token = await getStorage(["token"]).catch((err) => {
		console.error(`[Vibinex] Unable to get user token from local storage, url = ${url}`, err);
	});
	if (!token) {
		console.error(`Invalid token for url - ${url}`)
		return;
	}
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${token.token}`,
		},
		body: JSON.stringify(body),
	}).catch((e) => {
		console.error(`[apiCallOnprem] Error while getting data from API. URL: ${url}, payload: ${JSON.stringify(body)}`, e)
		destroyElement("loading");
		createElement("error");
		setTimeout(() => { destroyElement("error"); }, 2000);
	});
	if (!response) {
		return;
	}
	const res_json = await response.json().catch((e) => {
		console.error(`[apiCallOnprem] Error while deserializing data. URL: ${url}, error: `, e)
		destroyElement("loading");
		createElement("error");
		setTimeout(() => { destroyElement("error"); }, 2000);
	});
	if (!res_json) {
		return;
	}
	await setStorage({
		[url]: res_json
	}).catch((e) => {
		console.error(`[apiCallOnprem] Error while saving data to local storage. URL: ${url}, error: `, e)
		destroyElement("loading");
		createElement("error");
		setTimeout(() => { destroyElement("error"); }, 2000);
	});
	destroyElement("loading");
	return res_json;
}