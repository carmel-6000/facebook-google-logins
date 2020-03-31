import React from 'react';
import PropTypes from 'prop-types';
import gIcon from './../../../../icons/gicon.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from './faGoogle';
import './GLoginBtn.scss';
const SCOPES = [
  'openid',
  'email',
  'profile'
];//TODO- get more scopes in props?

//change client id to your project client_id
const client_id = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&access_type=offline&response_type=code&redirect_uri=${process.env.REACT_APP_SERVER_DOMAIN}%2Foauth2callback`;//http%3A%2F%2Flocalhost%3A8080

function GLoginBtn(props) {

  const handleGLogin = () => {


    if (props.additionalScopes && Array.isArray(props.additionalScopes)) {
      SCOPES.push(...props.additionalScopes);
    } else if (props.additionalScopes && typeof props.additionalScopes === "string") {
      SCOPES.push(props.additionalScopes);
    }


    //add state param to send extra data need in server side. for ex. roleId identefer
    const stateObj = {
      role: props.role,
      mt_bool: props.mtBool, //manage token
      loc: window.location.origin + (window.location.hash[0] === "#" ? `/#${props.redirectUrl || '/samples'}` : `${props.redirectUrl || '/samples'}`),
      failUrl: window.location.origin + (window.location.hash[0] === "#" ? `/#${props.failureUrl || '/'}` : `${props.failureUrl || '/'}`)
    }

    const state = serialize({ state: JSON.stringify(stateObj) })
    let url = GOOGLE_URL + `&scope=${SCOPES.join('%20')}&${state}`;
    window.location.href = url;
  }

  const serialize = (obj, prefix) => {
    var str = [];

    var p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + '[' + p + ']' : p;

        var v = obj[p];
        str.push((v !== null && typeof v === 'object')
          ? serialize(v, k)
          : encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
    }
    return str.join('&');
  };


  // use loginBtn class to add style to button 
  return (
    <button className="loginBtn loginBtn--google" onClick={handleGLogin}>
      {/* <FontAwesomeIcon icon={faGoogle} /> */}
      <img src={gIcon} className="g-icon"/>
      <div>
      חשבון גוגל</div>
    </button>
  )

}

GLoginBtn.propTypes = {
  mt_bool: PropTypes.bool,
  role: PropTypes.string,
  redirectUrl: PropTypes.string.isRequired,
  failureUrl: PropTypes.string.isRequired,
  additionalScopes: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ])
};

export default GLoginBtn;