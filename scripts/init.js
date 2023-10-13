'use strict';
console.log('[vibinex] Running content scripts');
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.action === "urlUpdated") {
        const newUrl = message.newUrl;
        await orchestrator(newUrl);
	}
});
