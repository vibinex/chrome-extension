import React, { useState, useEffect } from "react";
import "./style.css";

function IndexPopup() {
  const [data, setData] = useState("");

  return (
    <>
  <meta charSet="UTF-8" />
  <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="style.css" />
  <title>Vibinex</title>
  <div id="loading-div" className="container">
    <div className="loader" />
  </div>
  <div id="login-div" className="container">
    <div className="heading">
      <img
        src="../resources/vibinex-logo.png"
        className="heading_logo"
        alt="Vibinex logo"
      />
      <p className="heading_text">Vibinex</p>
    </div>
    <div className="second_box">
      <img src="../resources/lightIcon.png" alt="" className="light-icon" />
      <p id="highlightedText">
        Vibinex is active, but key features are missing.
      </p>
    </div>
    <div className="mainContent">
      <p className="secondHeading" id="advantagesHeading">
        Signup now to unlock the following:{" "}
      </p>
      <ul className="unorderList">
        <li>
          <span className="list_item">Highlight important PRs to review</span>
        </li>
        <li>
          <span className="list_item">
            Highlight important sections of code
          </span>
        </li>
        <li>
          <span className="list_item">Get PR review coverage</span>
        </li>
      </ul>
    </div>
  </div>
  <div id="session-div" className="container">
    <div className="heading">
      <img
        src="../resources/vibinex-logo.png"
        className="heading_logo"
        alt="Vibinex logo"
      />
      <p className="heading_text">Vibinex</p>
      <a
        className="button"
        style={{ width: "fit-content" }}
        href="https://vibinex.com/u"
        target="_blank"
      >
        Dashboard
      </a>
    </div>
    <div className="second_box">
      <img src="../resources/lightIcon.png" alt="" className="light-icon" />
      <p id="highlightedText">Vibinex is active!</p>
    </div>
    <div id="user_div">
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
  <footer>
    <a
      id="rate_us_anchor"
      href="https://chrome.google.com/webstore/detail/vibinex/jafgelpkkkopeaefadkdjcmnicgpcncc"
      target="_blank"
    >
      Rate us!
    </a>
    <p id="version">Version number</p>
  </footer>
</>

  );
}

export default IndexPopup;
