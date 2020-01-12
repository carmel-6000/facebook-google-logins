import React from 'react';

//change client id to your project client_id
const client_id = '1003912732062-p8kv1crq2llspph23pc4r4rj0bi99apn.apps.googleusercontent.com';
const YOUTUBE_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&access_type=offline&scope=openid%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.upload&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fytoauth2callback`;

function YTLoginBtn(props) {

  const handleYTLogin = () => {
    //add state param to send extra data need in server side. for ex. user identefer
    let url = YOUTUBE_URL + `&state=${props.youtubeState}`
    window.location.href = url;
  }

  // use loginBtn class to add style to button 
  return (
    <button className="loginBtn loginBtn--youtube" onClick={handleYTLogin} >
      <i className="fab fa-youtube" />
    </button>
  )

}
export default YTLoginBtn;