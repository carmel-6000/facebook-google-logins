import React, { Component } from 'react';
import propTypes from 'prop-types';
import './FacebookLogin.scss';

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
            <i className="fa fa-facebook" />
            חשבון פייסבוק
        </button>
    );
}


// function LoginWithFacebook(props) {


//     const handleClick = e => {
//         sessionStorage.setItem("login", "facebook");
//     }

//     const state = JSON.stringify({
//         successUrl: window.location.origin + (window.location.hash[0] === "#" ? `/#${props.successUrl || '/samples'}` : `${props.successUrl || '/samples'}`),
//         failUrl: window.location.origin + (window.location.hash[0] === "#" ? `/#${props.failureUrl || '/'}` : `${props.failureUrl || '/'}`)
//     })

//     return (<div>
// <FacebookLogin
//             appId={props.appId}
//             fields="name,email,picture"
//             autoLoad={false}
//             onFailure={res => console.log(res)}
//             reAuthenticate={true}
//             callback={e => console.log(e)}
//             // disableMobileRedirect={true}
//             isMobile={true}
//             redirectUri={process.env.REACT_APP_SERVER_DOMAIN + "/fbcallback/"}
//             textButton={"חשבון פייסבוק"}
//             cssClass="my-facebook-button"
//             icon="fa-facebook"
//             state={state}
//             onClick={handleClick}
//         />

//     </div >);
// }


LoginWithFacebook.propTypes = {
    appId: propTypes.string,
    successUrl: propTypes.string,
    failUrl: propTypes.string
}

export default LoginWithFacebook;

