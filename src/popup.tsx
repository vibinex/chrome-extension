import React, { useEffect, useState } from 'react';
import './style.css';
import icon from 'data-base64:~assets/icon.png';
import lightIcon from 'data-base64:~assets/lightIcon.png';

const IndexPopup: React.FC<{}> = () => {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    const manifest = chrome.runtime.getManifest();
    setVersion(manifest.version);
  }, []);

  useEffect(() => {
    chrome.storage.sync.get(['websiteUrl']).then(({ websiteUrl }) => {
      fetch(`${websiteUrl}/api/auth/providers`, { cache: 'no-store' }).then(async (res) => {
        const providers = await res.json() as { [key: string]: { name: string, signinUrl: string } };
        const loginDiv = document.getElementById('login-div');
        for (const provider of Object.values(providers)) {
          const logoURL = chrome.runtime.getURL(`assets/${provider.name}.svg`);
          const new_form = document.createElement('form');
          new_form.setAttribute('action', provider.signinUrl);
          new_form.setAttribute('target', '_blank');
          new_form.setAttribute('method', 'POST');
          new_form.style.width = '100%';
          new_form.innerHTML = `
            <input class="csrfToken" type="hidden" name="csrfToken" />
            <button type="submit" class="button">
              <img src="${logoURL}" alt="${provider.name}" />
              <span>Log in with ${provider.name}</span>
            </button>`;
          loginDiv?.appendChild(new_form);
        }
      });

      fetch(`${websiteUrl}/api/auth/csrf`, { cache: 'no-store' }).then(async (res) => {
        const json = await res.json();
        const csrf = json.csrfToken;
        const csrf_input_elements = document.getElementsByClassName('csrfToken');
        for (const element of csrf_input_elements) {
          (element as HTMLInputElement).value = csrf;
        }
      });

      fetch(`${websiteUrl}/api/auth/session`, { cache: 'no-store' }).then(async (res) => {
        const json = await res.json();
        const loadingDiv = document.querySelector('#loading-div') as HTMLDivElement;
        const sessionDiv = document.querySelector('#session-div') as HTMLDivElement;
        const loginDiv = document.querySelector('#login-div') as HTMLDivElement;

        if (loadingDiv && sessionDiv && loginDiv) {
          loadingDiv.style.display = 'none';

          if (json.user) {
            // User is logged in
            sessionDiv.style.display = 'flex';
            const signoutForm = document.getElementById('signout-form') as HTMLFormElement;
            signoutForm.setAttribute('action', `${websiteUrl}/api/auth/signout`);

            const { user } = json;
            const sessionImage = document.querySelector('#session-image') as HTMLImageElement;
            const sessionName = document.querySelector('#session-name') as HTMLHeadingElement;
            const sessionEmail = document.querySelector('#session-email') as HTMLSpanElement;

            sessionImage.src = user.image;
            sessionName.innerHTML = user.name;
            sessionEmail.innerHTML = user.email;

            chrome.storage.sync.set({
              userId: user.id,
              userName: user.name,
              userImage: user.image
            }).then(() => {
              console.debug(`[popup] userId has been set to ${user.id}`);
            }).catch(err => {
              console.error(`[popup] Sync storage could not be set. userId: ${user.id}`, err);
            });
          } else {
            // No session means user not logged in
            loginDiv.style.display = 'flex';
          }
        }
      });
    });
  }, []);

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
