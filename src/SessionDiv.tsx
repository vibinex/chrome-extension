import exp from "constants";
import React from "react";

import icon from 'data-base64:~assets/icon.png';
import lightIcon from 'data-base64:~assets/lightIcon.png';

const SessionDiv: React.FC<{}> = () => {
    return (
        <div id="session-div" className="container">
            <div className="heading">
                <img src={icon} className="heading_logo" alt="Vibinex logo" />
                <p className="heading_text">Vibinex</p>
                <a
                    className="button"
                    style={{ width: 'fit-content' }}
                    href="https://vibinex.com/u"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Dashboard
                </a>
            </div>
            <div className="second_box">
                <img src={lightIcon} alt="" className="light-icon" />
                <p id="highlightedText">Vibinex is active!</p>
            </div>
            <div id="user_div" style={{ textAlign: 'center' }}>
                <img
                    id="session-image"
                    alt="User Profile Pic"
                    className="profile_picture"
                />
                <h1 id="session-name" className="title" />
                <p className="subtitle">
                    You are logged in as <span id="session-email" />
                </p>
                <form id="signout-form" method="POST" target="_blank">
                    <input className="csrfToken" type="hidden" name="csrfToken" />
                    <button type="submit" className="logout_button">
                        <small>(Logout)</small>
                    </button>
                </form>
                <a
                    href="https://www.producthunt.com/products/vibinex-code-review/reviews?utm_source=badge-product_review&utm_medium=badge&utm_souce=badge-vibinex-code-review"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=534479&theme=light"
                        alt="Vibinex Code-Review - A distributed process for reviewing pull requests. | Product Hunt"
                        className="producthunt_review_button"
                        width={250}
                        height={54}
                    />
                </a>
            </div>
		</div>
    );
};

export default SessionDiv;