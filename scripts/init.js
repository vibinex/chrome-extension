/**
 * Initializes the script once the window is loaded. It performs the following tasks:
 * 1. Retrieves the 'websiteUrl' and 'userId' from the Chrome local storage.
 * 2. Logs the retrieved 'userId' (this log is marked for future removal).
 * 3. Checks the current document's URL and invokes the 'orchestrator' function with it.
 * 4. Sets up a MutationObserver to monitor changes in the document's body. 
 *    If the document's URL changes, the 'orchestrator' function is invoked again with the new URL.
 * 
 * Note: This script assumes it's running in the context of a browser extension, given its use of the 'chrome.storage' API.
 */
console.log('[vibinex] Running content scripts');
'use strict';
window.onload = () => {
	chrome.storage.local.get(["websiteUrl", "userId"]).then(({ websiteUrl, userId }) => {
		console.log("We have the userId:", userId) // FIXME: remove this console.log
		let oldHref = document.location.href;
		orchestrator(oldHref, websiteUrl, userId);
		return new MutationObserver(mutations => {
			mutations.forEach(() => {
				if (oldHref !== document.location.href) {
					oldHref = document.location.href;
					orchestrator(oldHref, websiteUrl, userId);
				}
			})
		}).observe(document.querySelector("body"), { childList: true, subtree: true });
	});
}