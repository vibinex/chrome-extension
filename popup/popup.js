chrome.storage.sync.get(["userId", "userName", "userImage"]).then(({ userId, userName, userImage }) => {
	console.log(`[popup] Received user information from storage`, userId, userName);
	if (userId) {
		if (userName && userImage) {
			console.log("[popup] user is logged in");
			const highlightedText = document.getElementById("highlightedText");
			highlightedText.innerHTML = "Vibinex is active";
			const advantagesHeader = document.getElementById("advantagesHeading");
			advantagesHeader.innerHTML = "Advantages:";

			const ctaSection = document.getElementById("signUpButton");
			ctaSection.innerHTML = `<div id="user_div">
			<img src="${userImage}" width="25px" class="profile_picture"/> <p id="salutation">Hello ${userName}!</p>
			</div>`;
		}
	}
});