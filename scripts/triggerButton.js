const vibinexSymbol = `
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 98.26 87.26" width="20" height="20">
	<defs>
		<style>.cls-1{fill:#010101;stroke:#f3f3f3;stroke-miterlimit:10;stroke-width:0.25px;}.cls-2{fill:#0e84ab;}.cls-3{fill:#fff;}</style>
	</defs>
	<rect class="cls-1" x="0.13" y="0.13" width="98" height="87" rx="17.77"/>
	<path class="cls-2" d="M6.48,69.74l32.91-33.91,15.81,44.58-23.66-5.31,3.27-23.28q-6.14,10.5-12.25,21Z"/>
	<path class="cls-2" d="M94.19,67.92,57.48,38.28l-.33,42,16.44-5.55-10-23.24,17.64,21Z"/>
	<path class="cls-3" d="M9.98,61.43l35.65-51.89c3.22,4.65,32.45,42.78,34.94,45.19L53.08,29.41l.86,39.53-13.8-40.18Z"/>
</svg>`;

const addTriggerButton = (provider, prUrl, websiteUrl) => {
	if (!['github', 'bitbucket'].includes(provider)) {
		console.error(`[Vibinex/addTriggerButton] Invalid provider: ${provider}`);
		return;
	}
	const containerQuerySelector = {
		'github': '.gh-header-actions',
		'bitbucket': 'div:has(> div[data-qa="pr-header-actions-drop-down-menu-styles"])'
	};
	const containerElement = document.querySelector(containerQuerySelector[provider]);

	if (containerElement && !document.getElementById('vibinex-trigger-button')) {
		const triggerButton = document.createElement('button');
		triggerButton.id = 'vibinex-trigger-button';
		triggerButton.style.display = 'inline-flex';
		triggerButton.style.alignItems = 'center';
		triggerButton.style.gap = '5px';

		if (provider === 'github') {
			triggerButton.className = 'btn btn-sm';
		}
		if (provider === 'bitbucket') {
			triggerButton.style.border = 'none';
			triggerButton.style.borderRadius = '3px';
			triggerButton.style.cursor = 'pointer';
			triggerButton.style.fontWeight = 500;
			triggerButton.style.paddingLeft = '10px';
			triggerButton.style.paddingRight = '10px';
			triggerButton.style.color = `var(--ds-text, #42526E) !important`;
		}
		
		triggerButton.innerHTML = `${vibinexSymbol} Process this PR`;
		
		triggerButton.addEventListener('click', async () => {
			console.log("clicked");
			triggerButton.disabled = true;
			triggerButton.textContent = 'Triggering...';
			try {
				const body = { url: prUrl };
				console.log("body", body);
				const response = await apiCallOnprem(`${websiteUrl}/api/extension/trigger`, body);
				console.log("response", response);

				if (!response) throw new Error('Network response was not ok');

				triggerButton.textContent = 'Triggered';
			} catch (error) {
				console.error('Error triggering PR review:', error);
				triggerButton.textContent = 'Failed. Try again?';
				triggerButton.style.color = 'red';
				triggerButton.disabled = false;
			}
		});

		containerElement.insertBefore(triggerButton, containerElement.firstChild);
	}
};