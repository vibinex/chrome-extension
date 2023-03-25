chrome.storage.sync.get(["websiteUrl"]).then(({ websiteUrl }) => {
	fetch(`${websiteUrl}/api/auth/csrf`).then(async (res) => {
		const json = await res.json();
		const csrf = json.csrfToken;
		document.querySelector("#csrfToken-signout").value = csrf;
		document.querySelector("#csrfToken-google").value = csrf;
		document.querySelector("#csrfToken-github").value = csrf;
		document.querySelector("#csrfToken-bitbucket").value = csrf;
	});

	fetch(`${websiteUrl}/api/auth/session`).then(async (res) => {
		const json = await res.json();
		console.log("[session fetch]", json);
		document.querySelector("#loading-div").style.display = "none";
		if (json.user) {
			//user is logged in
			document.querySelector("#session-div").style.display = "flex";
			document.getElementById("signout-form").setAttribute('action', `${websiteUrl}/api/auth/signout`)

			const { user } = json;
			document.querySelector("#session-image").src = user.image;
			document.querySelector("#session-name").innerHTML = user.name;
			document.querySelector("#session-email").innerHTML = user.email;

			console.log(user);
			chrome.storage.sync.set({
				userId: user.userId,
				userName: user.name,
				userImage: user.image
			}).then(() => {
				console.debug(`[contentScript] userId has been set from ${userId} to ${event.data.userId}`);
			}).catch(err => {
				console.error(`[contentScript] Sync storage could not be set. initial userId: ${userId}; final userId: ${event.data.userId}`, err);
			})
		} else {
			// no session means user not logged in
			document.querySelector("#login-div").style.display = "flex";
			document.getElementById("google-form").setAttribute('action', `${websiteUrl}/api/auth/signin/google`)
			document.getElementById("github-form").setAttribute('action', `${websiteUrl}/api/auth/signin/github`)
			document.getElementById("bitbucket-form").setAttribute('action', `${websiteUrl}/api/auth/signin/bitbucket`)
		}
	});
});