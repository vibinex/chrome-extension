const createPanelButton = (websiteUrl) => {
	const vibinexLogo = document.createElement("img");
	vibinexLogo.src = `${websiteUrl}/favicon.ico`;
	vibinexLogo.style.width = '30px';
	vibinexLogo.style.verticalAlign = 'middle';

	const panelButton = document.createElement('button');
	panelButton.style.position = 'fixed';
	panelButton.style.left = '0px';
	panelButton.style.top = '50%';
	panelButton.style.zIndex = '1000';
	panelButton.appendChild(vibinexLogo);
	panelButton.style.backgroundColor = 'black';
	panelButton.style.borderTopRightRadius = '20px';
	panelButton.style.borderBottomRightRadius = '20px';

	panelButton.ondragstart = (e) => {
		e.preventDefault();
	};

	return panelButton;
};

const createPanel = () => {
	const panel = document.createElement('div');
	panel.style.position = 'fixed';
	panel.style.left = '0';
	panel.style.top = '0';
	panel.style.height = '100vh';
	panel.style.width = '33.33%';
	panel.style.backgroundColor = 'beige';
	panel.style.zIndex = '1000';
	panel.style.display = 'none';
	panel.style.borderTopRightRadius = '20px';
	panel.style.borderBottomRightRadius = '20px';
	panel.style.padding = '10px';
	panel.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
	panel.style.transition = 'all 0.3s ease-in-out';
	document.body.appendChild(panel);
	return panel;
};

const createCloseButton = (panel) => {
	const closeButton = document.createElement('button');
	closeButton.textContent = 'X';
	closeButton.style.position = 'absolute';
	closeButton.style.top = '50%';
	closeButton.style.left = '100%';
	closeButton.style.zIndex = '1001';
	closeButton.style.cursor = 'pointer';
	closeButton.style.backgroundColor = 'beige';
	closeButton.style.border = 'none';
	closeButton.style.padding = '10px 15px';
	closeButton.style.borderTopRightRadius = '20px';
	closeButton.style.borderBottomRightRadius = '20px';
	closeButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
	panel.appendChild(closeButton);
	return closeButton;
};