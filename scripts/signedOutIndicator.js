/**
 * Checks if user is logged out and call addIndicator
 * @param {string} provider
 * @param {string} websiteUrl
 */
function addSignedOutIndicator(websiteUrl) {
    chrome.runtime.sendMessage({ message: "check_login_status," + websiteUrl.toString() }, async function (response) {
        if (response.status === false) {
            createElement("login")
        }
    });
}
