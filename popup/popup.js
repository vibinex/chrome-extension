chrome.storage.local.get(["websiteUrl"]).then(({ websiteUrl }) => {
	fetch(`${websiteUrl}/api/auth/providers`, { cache: 'no-store' }).then(async (res) => {
		const providers = await res.json();
		const loginDiv = document.getElementById("login-div");
		for (const provider of Object.values(providers)) {
			const new_form = document.createElement("form")
			new_form.setAttribute('action', provider.signinUrl);
			new_form.setAttribute('target', "_blank")
			new_form.setAttribute('method', "POST")
			new_form.style.width = '100%';
			new_form.innerHTML = `			    
			<input class="csrfToken" type="hidden" name="csrfToken" />
			<button type="submit" class="button">
				<img src="/resources/${provider.id}.svg" alt="${provider.name}" />
				<span>Log in with ${provider.name}</span>
			</button>`
			loginDiv.appendChild(new_form);
		}
	})

	fetch(`${websiteUrl}/api/auth/csrf`, { cache: 'no-store' }).then(async (res) => {
		const json = await res.json();
		const csrf = json.csrfToken;
		const csrf_input_elements = document.getElementsByClassName("csrfToken");
		for (const element of csrf_input_elements) {
			element.value = csrf;
		}
	});

	fetch(`${websiteUrl}/api/auth/session`, { cache: 'no-store' }).then(async (res) => {
		const json = await res.json();
		document.querySelector("#loading-div").style.display = "none";
		if (json.user) {
			//user is logged in
			document.querySelector("#session-div").style.display = "flex";
			document.getElementById("signout-form").setAttribute('action', `${websiteUrl}/api/auth/signout`)

			const { user } = json;
			document.querySelector("#session-image").src = user.image;
			document.querySelector("#session-name").innerHTML = user.name;
			document.querySelector("#session-email").innerHTML = user.email;
			chrome.cookies.get({ url: websiteUrl, name: '__Secure-next-auth.session-token' })
			.then((cookie) => {
				const tokenval = cookie.value;
				chrome.storage.local.set({
					userId: user.id,
					userName: user.name,
					userImage: user.image,
					token: tokenval,
				}).then(() => {
					console.debug(`[popup] userId has been set to ${user.id}`);
				}).catch(err => {
					console.error(`[popup] Sync storage could not be set. userId: ${user.id}`, err);
				})
			})
			.catch((err) =>{
				console.error("Unable to get Cookie value for session: ", err);
			});
		} else {
			// no session means user not logged in
			document.querySelector("#login-div").style.display = "flex";
		}
	});
});

window.addEventListener('load', () => {
	const manifestData = chrome.runtime.getManifest();
	const version_p = document.getElementById("version")
	version_p.innerHTML = "v" + manifestData.version;
})