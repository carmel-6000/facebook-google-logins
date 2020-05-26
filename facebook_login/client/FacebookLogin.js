import React, { Component, useEffect } from 'react';
import propTypes from 'prop-types';
import './FacebookLogin.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook } from './faFacebook' //we saved the icon instead of installing another font-awesome package.
import Auth from '../../../auth/Auth';

function LoginWithFacebook(props) {


    const connectToServer = async (response) => {
        try {
            if (response && response.authResponse && response.authResponse && response.authResponse.accessToken) {
                const [res, err] = await Auth.superAuthFetch(`/fbcallback?access_token=${response.authResponse.accessToken}`);
                if(res && res.success && props.afterLogin){
                    props.afterLogin();
                }

            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const login = () => {
        window.FB.login(function (response) {
            // handle the response 
            console.log("respone!", response);
            connectToServer(response);

        });
    }

    window.fbAsyncInit = function () {
        window.FB.init({
            appId: props.appId,
            cookie: true,                     // Enable cookies to allow the server to access the session.
            xfbml: true,                     // Parse social plugins on this webpage.
            version: 'v7.0'           // Use this Graph API version for this call.
        });
    };




    return (
        <button className="my-facebook-button" onClick={login}>
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

