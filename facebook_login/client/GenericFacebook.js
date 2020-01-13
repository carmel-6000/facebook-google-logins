import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import GenericTools from '../../tools/GenericTools'; //change the location

function GenericFacebook(props) {

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

        if (!err) {
            GenericTools.safe_redirect("/");
        } else{
            console.log(err);
        }
    }

    return (<div>
        <FacebookLogin
            appId = "" //type your app id
            fields = "name,email,picture"
            callback = {responseFacebook}
            autoLoad = {false}
            onFailure = {res => console.log(res)}
            reAuthenticate = {true}
            disableMobileRedirect = {true}
        />

    </div >);
}

export default GenericFacebook;