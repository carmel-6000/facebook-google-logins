import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import GenericTools from '../../../tools/GenericTools'; //change the location
import Auth from '../../../auth/Auth';
import propTypes from 'prop-types';
import './FacebookLogin.scss';

function LoginWithFacebook(props) {

    const responseFacebook = async (res) => {
        //res - response from facebook's api
        const [response, err] = await Auth.superAuthFetch('/fbcallback', {
            method: "POST",
            body: JSON.stringify({ data: res }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        console.log(res);
        if (!err) {
            props.cb && props.cb();
            GenericTools.safe_redirect(props.redirectUrl || "/");
        } else {
            console.log(err);
        }
    }

    return (<div>
        <FacebookLogin
            appId={props.appId} //type your app id
            fields="name,email,picture"
            callback={responseFacebook}
            autoLoad={false}
            onFailure={res => console.log(res)}
            reAuthenticate={true}
            disableMobileRedirect={true}
            textButton = {"חשבון פייסבוק"}
            cssClass="my-facebook-button"
            icon = "fa-facebook"
        />

    </div >);
}
LoginWithFacebook.propTypes = {
    appId : propTypes.string,
    redirectUrl : propTypes.string,
    cb : propTypes.func
}

export default LoginWithFacebook;

