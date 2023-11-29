/**
 * Checks if user is logged out and call addIndicator
 * @param {string} provider
 * @param {string} websiteUrl
 */
function addSignedOutIndicator(websiteUrl, provider) {
    const message = {
        action: "check_login_status",
        websiteUrl: websiteUrl,
        provider: provider
    }
    chrome.runtime.sendMessage({
        message: JSON.stringify(message)
    }, async function (response) {
        if (response.status === false) {
            createElement(provider)
        }
    });
}
