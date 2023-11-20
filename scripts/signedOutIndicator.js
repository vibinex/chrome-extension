/**
 * Checks if user is logged out and call addIndicator
 * @param {string} provider
 * @param {string} websiteUrl
 */
function addSignedOutIndicator(websiteUrl) {
    chrome.runtime.sendMessage({ message: "check_login_status," + websiteUrl.toString() }, async function (response) {
        if (response.status === false) {
            // Fetch authentication providers from the server.
            fetch(`${websiteUrl}/api/auth/providers`, { cache: 'no-store' }).then(async (res) => {
                const providers = await res.json();
                // Create a new div element for signed out indicator
                const loginProviderButton = document.createElement("div");
                loginProviderButton.setAttribute('id', "vibinex-indicator");
                loginProviderButton.setAttribute('class', "span");
                loginProviderButton.innerHTML = `
        <img src="https://vibinex.com/favicon.ico" alt="Vibinex Logo" />
        <span>Logged out of Vibinex</span>
    `;
                document.body.appendChild(loginProviderButton);
            }
            )
        }
    });
}
