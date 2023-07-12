import React from "react";
import icon from 'data-base64:~assets/icon.png';
import lightIcon from 'data-base64:~assets/lightIcon.png';

const LoginDiv: React.FC<{}> = () => {
    return (
        <div id="login-div" className="container">
            <div className="heading">
                <img src={icon} className="heading_logo" alt="Vibinex logo" />
                <p className="heading_text">Vibinex</p>
            </div>
            <div className="second_box">
                <img src={lightIcon} alt="" className="light-icon" />
                <p id="highlightedText">Vibinex is active, but key features are missing.</p>
            </div>
            <div className="mainContent">
                <p className="secondHeading" id="advantagesHeading">
                    Signup now to unlock the following:
                </p>
                <ul className="unorderList">
                    <li>
                        <span className="list_item">Highlight important PRs to review</span>
                    </li>
                    <li>
                        <span className="list_item">Highlight important sections of code</span>
                    </li>
                    <li>
                        <span className="list_item">Get PR review coverage</span>
                    </li>
                </ul>
            </div>
		</div>
    );
};

export default LoginDiv;