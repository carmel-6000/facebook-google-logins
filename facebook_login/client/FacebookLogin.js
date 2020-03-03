import React, { Component } from 'react';
import propTypes from 'prop-types';
import './FacebookLogin.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook } from './faFacebook' //we saved the icon instead of installing another font-awesome package.
function LoginWithFacebook(props) {

    const handleClick = e => {
        sessionStorage.setItem("login", "facebook");

        const state = JSON.stringify({
            successUrl: encodeURIComponent(window.location.origin + (window.location.hash[0] === "#" ? `/#${props.successUrl || '/samples'}` : `${props.successUrl || '/samples'}`)),
            failUrl: encodeURIComponent(window.location.origin + (window.location.hash[0] === "#" ? `/#${props.failureUrl || '/'}` : `${props.failureUrl || '/'}`))
        });

        const url = `https://www.facebook.com/v6.0/dialog/oauth?client_id=${props.appId}&redirect_uri=${process.env.REACT_APP_SERVER_DOMAIN}/fbcallback/&state=${state}`;
        window.location.href = url;


    }

    return (
        <button className="my-facebook-button" onClick={handleClick}>
            <FontAwesomeIcon icon={faFacebook}></FontAwesomeIcon>
            {
                props.buttonText || "חשבון פייסבוק"
            }        
            </button>
    );
}

LoginWithFacebook.propTypes = {
    appId: propTypes.string,
    successUrl: propTypes.string,
    failUrl: propTypes.string,
    buttonText: propTypes.string
}

export default LoginWithFacebook;

