// Retrieve the website URL from Chrome's local storage.
chrome.storage.local.get(["websiteUrl"]).then(({ websiteUrl }) => {

	// Fetch authentication providers from the server.
	fetch(`${websiteUrl}/api/auth/providers`, { cache: 'no-store' }).then(async (res) => {
		const providers = await res.json();
		const loginDiv = document.getElementById("login-div");

		// Iterate through the authentication providers and create a form for each.
		for (const provider of Object.values(providers)) {
			const new_form = document.createElement("form");
			new_form.setAttribute('action', provider.signinUrl);
			new_form.setAttribute('target', "_blank");
			new_form.setAttribute('method', "POST");
			new_form.style.width = '100%';
			new_form.innerHTML = `
			<input class="csrfToken" type="hidden" name="csrfToken" />
			<button type="submit" class="button">
				<img src="/resources/${provider.id}.svg" alt="${provider.name}" />
				<span>Log in with ${provider.name}</span>
			</button>`;
			loginDiv.appendChild(new_form);
		}
	});

	// Fetch CSRF token from the server.
	fetch(`${websiteUrl}/api/auth/csrf`, { cache: 'no-store' }).then(async (res) => {
		const json = await res.json();
		const csrf = json.csrfToken;
		const csrf_input_elements = document.getElementsByClassName("csrfToken");

		// Populate all CSRF input fields with the fetched token.
		for (const element of csrf_input_elements) {
			element.value = csrf;
		}
	});

	// Fetch the current session from the server.
	fetch(`${websiteUrl}/api/auth/session`, { cache: 'no-store' }).then(async (res) => {
		const json = await res.json();
		document.querySelector("#loading-div").style.display = "none";

		if (json.user) {
			// If a user session exists, display the user's session details.
			document.querySelector("#session-div").style.display = "flex";
			document.getElementById("signout-form").setAttribute('action', `${websiteUrl}/api/auth/signout`);

			const { user } = json;
			document.querySelector("#session-image").src = user.image;
			document.querySelector("#session-name").innerHTML = user.name;
			document.querySelector("#session-email").innerHTML = user.email;
			// Retrieve the session token from the cookie and store user details in Chrome's local storage.
			let tokenval = "";
			chrome.cookies.get({ url: websiteUrl, name: '__Secure-next-auth.session-token' })
				.then((cookie) => {
					tokenval = cookie.value;
					chrome.storage.local.set({
						userId: user.id,
						userName: user.name,
						userImage: user.image,
						token: tokenval,
					}).then(() => {
						console.debug(`[popup] userId has been set to ${user.id}`);
					}).catch(err => {
						console.error(`[popup] Local storage could not be set. userId: ${user.id}`, err);
					});
				})
				.catch((err) => {
					console.error("Unable to get Cookie value for session: ", err);
				});
        } else {
            // If no user session exists, display the login options.
            document.querySelector("#login-div").style.display = "flex";
        }
    });
});

// Display the extension version on window load.
window.addEventListener('load', () => {
    const manifestData = chrome.runtime.getManifest();
    const version_p = document.getElementById("version");
    version_p.innerHTML = "v" + manifestData.version;
});
