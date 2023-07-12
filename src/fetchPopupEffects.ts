import { useEffect } from "react";

const useFetchPopupData = (chrome: any) => {
    useEffect(() => {
		chrome.storage.sync.get(['websiteUrl']).then(({ websiteUrl }) => {
			fetch(`${websiteUrl}/api/auth/providers`, { cache: 'no-store' }).then(async (res) => {
				const providers = await res.json() as { [key: string]: { name: string, signinUrl: string } };
				const loginDiv = document.getElementById('login-div');
				for (const provider of Object.values(providers)) {
					const logoURL = chrome.runtime.getURL(`assets/${provider.name}.svg`);
					const new_form = document.createElement('form');
					new_form.setAttribute('action', provider.signinUrl);
					new_form.setAttribute('target', '_blank');
					new_form.setAttribute('method', 'POST');
					new_form.style.width = '100%';
					new_form.innerHTML = `
						<input class="csrfToken" type="hidden" name="csrfToken" />
						<button type="submit" class="button">
							<img src="${logoURL}" alt="${provider.name}" />
							<span>Log in with ${provider.name}</span>
						</button>`;
					loginDiv?.appendChild(new_form);
				}
			});

			fetch(`${websiteUrl}/api/auth/csrf`, { cache: 'no-store' }).then(async (res) => {
				const json = await res.json();
				const csrf = json.csrfToken;
				const csrf_input_elements = document.getElementsByClassName('csrfToken');
				for (const element of csrf_input_elements) {
					(element as HTMLInputElement).value = csrf;
				}
			});

			fetch(`${websiteUrl}/api/auth/session`, { cache: 'no-store' }).then(async (res) => {
				const json = await res.json();
				const loadingDiv = document.querySelector('#loading-div') as HTMLDivElement;
				const sessionDiv = document.querySelector('#session-div') as HTMLDivElement;
				const loginDiv = document.querySelector('#login-div') as HTMLDivElement;

				if (loadingDiv && sessionDiv && loginDiv) {
					loadingDiv.style.display = 'none';

					if (json.user) {
						// User is logged in
						sessionDiv.style.display = 'flex';
						const signoutForm = document.getElementById('signout-form') as HTMLFormElement;
						signoutForm.setAttribute('action', `${websiteUrl}/api/auth/signout`);

						const { user } = json;
						const sessionImage = document.querySelector('#session-image') as HTMLImageElement;
						const sessionName = document.querySelector('#session-name') as HTMLHeadingElement;
						const sessionEmail = document.querySelector('#session-email') as HTMLSpanElement;

						sessionImage.src = user.image;
						sessionName.innerHTML = user.name;
						sessionEmail.innerHTML = user.email;

						chrome.storage.sync.set({
							userId: user.id,
							userName: user.name,
							userImage: user.image
						}).then(() => {
							console.debug(`[popup] userId has been set to ${user.id}`);
						}).catch(err => {
							console.error(`[popup] Sync storage could not be set. userId: ${user.id}`, err);
						});
					} else {
						// No session means user not logged in
						loginDiv.style.display = 'flex';
					}
				}
			});
		});
	}, [chrome]);
};

export default useFetchPopupData;