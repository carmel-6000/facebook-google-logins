import React, { Component} from 'react';
import propTypes from 'prop-types';
import './FacebookLogin.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook } from './faFacebook' //we saved the icon instead of installing another font-awesome package.
import Auth from '../../../auth/Auth';

function LoginWithFacebook(props) {

    const connectToServer = async (response) => {
        try {
            props.beforeLogin && props.beforeLogin();
            if (response && response.authResponse && response.authResponse && response.authResponse.accessToken) {
                const [res, err] = await Auth.superAuthFetch(`/fbcallback?access_token=${response.authResponse.accessToken}`);
                if (res && res.success && props.afterLogin) {
                    props.afterLogin();
                }

            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const login = () => {
        window.FB.getLoginStatus(function (resp) {
            if (resp.status !== 'connected') {
                window.FB.login(function (response) {
                    // handle the response 
                    connectToServer(response);
                }, { auth_type: 'reauthenticate' });
            }
            else{
                connectToServer(resp);
            }
        })
    }




    return (
        <div>
            <button className="my-facebook-button" onClick={login}>
                <FontAwesomeIcon icon={faFacebook}></FontAwesomeIcon>
                {
                    props.buttonText || "חשבון פייסבוק"
                }
            </button>
        </div>
    );
}

LoginWithFacebook.propTypes = {
    appId: propTypes.string,
    successUrl: propTypes.string,
    failUrl: propTypes.string,
    buttonText: propTypes.string
}

export default LoginWithFacebook;

