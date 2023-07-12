import React, { useEffect, useState } from 'react';
import './style.css';

import LoadingDiv from './LoadingDiv';
import LoginDiv from './LoginDiv';
import SessionDiv from './SessionDiv';

import useFetchPopupData from './fetchPopupEffects';
import useVersion from '~VersionUpdate';

const IndexPopup: React.FC<{}> = () => {
	const version = useVersion(chrome);
	useFetchPopupData(chrome);

	return (
		<>
			<meta charSet="UTF-8" />
			<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<link rel="stylesheet" href="style.css" />
			<title>Vibinex</title>
			<LoadingDiv/>
			<LoginDiv/>
			<SessionDiv/>
			<footer>
				<a
					id="rate_us_anchor"
					href="https://chrome.google.com/webstore/detail/vibinex/jafgelpkkkopeaefadkdjcmnicgpcncc"
					target="_blank"
					rel="noopener noreferrer"
				>
					Rate us!
				</a>
				<p id="version">Version {version}</p>
			</footer>
		</>
	);
};

export default IndexPopup;
