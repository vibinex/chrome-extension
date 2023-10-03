/**
 * Creates and appends a floating UI element to the page based on the specified type.
 * 
 * @param {string} type - The type of element to create ("loading", "add", or "error").
 * @param {string} websiteUrl - The base URL for Vibinex (default: "https://vibinex.com").
 */
function createElement(type = "add", websiteUrl = "https://vibinex.com") {
	let loadingIconID;
	let imgUrl;
	let bannerMessage;
	// Determine the type of element to create and set appropriate attributes.
	switch (type) {
		case "loading":
			loadingIconID = "vibinexLoadingGif";
			imgUrl = "https://media.tenor.com/wpSo-8CrXqUAAAAi/loading-loading-forever.gif";
			bannerMessage = "Please wait. Vibinex is loading...";
			break;
		case "add":
			loadingIconID = "vibinexPlusIcon";
			imgUrl = "https://img.freepik.com/free-icon/add-button-with-plus-symbol-black-circle_318-48599.jpg";
			bannerMessage = "Add to Vibinex";
			break;
		case "error":
			loadingIconID = "vibinexErrorIcon";
			imgUrl = "https://cdn-icons-png.flaticon.com/512/1243/1243911.png?w=740&t=st=1680153899~exp=1680154499~hmac=be129e6a5a3dd4b9a362138086907f3330050f0a300473c5ed0e7e9541ece2de"
			bannerMessage = "Something went wrong";
			break;
		default:
			break;
	}
	// Create and style the Vibinex logo.
	const img = document.createElement("img");
	img.setAttribute('id', 'vibinexLogo')
	img.src = `${websiteUrl}/favicon.ico`;
	img.style.width = '35px';
	img.style.height = '35px';
	img.style.borderRadius = '35px';
	img.style.position = 'fixed';
	img.style.left = '30px';
	img.style.bottom = '50px';
	img.style.cursor = 'pointer';
	img.style.zIndex = '200';

	// Create and style the loading or action icon.
	const loadingGif = document.createElement('img');
	loadingGif.setAttribute('id', loadingIconID)
	loadingGif.src = imgUrl;
	loadingGif.style.width = '35px';
	loadingGif.style.height = '35px';
	loadingGif.style.borderRadius = '35px';
	loadingGif.style.cursor = 'pointer';

	// Create a link that redirects to the Vibinex website.
	const redirectLink = document.createElement('a');
	redirectLink.style.position = 'fixed';
	redirectLink.style.left = '58px';
	redirectLink.style.bottom = '45px';
	redirectLink.style.zIndex = '200';
	if (type === "add") {
		redirectLink.href = `${websiteUrl}/docs`;
	}
	redirectLink.appendChild(loadingGif);
	redirectLink.appendChild(img);

	const infoBanner = document.createElement('div');
	infoBanner.setAttribute('id', 'floating-info');
	// Create and style an information banner that displays a tooltip on hover.
	function changeCss(value) {
		infoBanner.innerHTML = bannerMessage;
		infoBanner.style.backgroundColor = 'black';
		infoBanner.style.color = 'white';
		infoBanner.style.padding = '10px';
		infoBanner.style.display = value ? 'block' : 'none';
		infoBanner.style.position = 'fixed';
		infoBanner.style.left = '30px';
		infoBanner.style.bottom = '85px';
		infoBanner.style.borderColor = 'red';
		infoBanner.style.border = "thin solid #D6D6D6";
		infoBanner.style.borderRadius = '5px';
		infoBanner.style.zIndex = '200'
	}
	redirectLink.addEventListener('mouseover', () => changeCss(true));
	redirectLink.addEventListener('mouseout', () => changeCss(false));
    // Append the created elements to the document body.
	document.body.appendChild(redirectLink);
	document.body.appendChild(infoBanner);
}

/**
 * Removes the previously created floating UI elements from the page.
 * 
 * @param {string} type - The type of element to remove ("loading", "add", or "error").
 */
function destroyElement(type) {
	document.getElementById('vibinexLogo').remove();
	document.getElementById('floating-info').remove();
	if (type === "loading")
		document.getElementById('vibinexLoadingGif').remove();
	else if (type === "add")
		document.getElementById('vibinexPlusIcon').remove();
	else if (type === "error")
		document.getElementById('vibinexErrorIcon').remove();
}

/**
 * Computes the SHA-256 hash of a given value.
 * 
 * @param {string} value - The input value to hash.
 * @returns {string} - The computed SHA-256 hash in hexadecimal format.
 */
async function sha256(value) {
	const buffer = new TextEncoder().encode(value);
	const hash = await crypto.subtle.digest('SHA-256', buffer);
	const hexString = Array.from(new Uint8Array(hash))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
	return hexString;
}