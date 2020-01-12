import React from 'react';

const SCOPES = [
  'openid',
  'email',
  'profile'
];//TODO- get more scopes in props?

//change client id to your project client_id
const client_id = '************* REPLACE WITH THE CLIENT_ID YOU GET FROM THE GOOGLE DEVELOPERS CONSOLE *******88';
const GOOGLE_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&access_type=offline&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Foauth2callback`;

function GLoginBtn(props) {

  const handleGLogin = () => {
    
    
    if (props.additionalScopes && Array.isArray(props.additionalScopes)) {
      SCOPES.push(...props.additionalScopes);
    } else if(props.additionalScopes && typeof props.additionalScopes === "string"){
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
    <button className="loginBtn loginBtn--google" onClick={handleGLogin} >
      <i className="fab fa-google" />
      Login with google
    </button>
  )

}
export default GLoginBtn;