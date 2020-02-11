import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import GenericTools from '../../../tools/GenericTools'; //change the location
import Auth from '../../../auth/Auth';
import propTypes from 'prop-types';
import './FacebookLogin.scss';

function LoginWithFacebook(props) {


    const handleClick = e => {
        sessionStorage.setItem("login", "facebook");
    }

    const state = JSON.stringify({
        successUrl: window.location.origin + (window.location.hash[0] === "#" ? `/#${props.successUrl || '/samples'}` : `${props.successUrl || '/samples'}`),
        failUrl: window.location.origin + (window.location.hash[0] === "#" ? `/#${props.failureUrl || '/'}` : `${props.failureUrl || '/'}`)
    })

    return (<div>
        <FacebookLogin
            appId={props.appId} //type your app id
            fields="name,email,picture"
            autoLoad={false}
            onFailure={res => console.log(res)}
            reAuthenticate={true}
            // disableMobileRedirect={true}
            redirectUri={process.env.REACT_APP_SERVER_DOMAIN + "/fbcallback/"}
            textButton={"חשבון פייסבוק"}
            cssClass="my-facebook-button"
            icon="fa-facebook"
            state={state}
            onClick={handleClick}
        />

    </div >);
}
LoginWithFacebook.propTypes = {
    appId: propTypes.string,
    successUrl: propTypes.string,
    failUrl: propTypes.string
}

export default LoginWithFacebook;

