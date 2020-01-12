var fs = require('fs');
const path = require('path');
const prettyBytes = require("pretty-bytes")

const Youtube = require('youtube-api')
const { OAuth2Client } = require('google-auth-library');

const clientConfig = require('../config/client_secret.json');
const TokensManager = require('./TokensManager');

var logYoutube = require('debug')('model:youtube');
const videoFolder = 'videos'


module.exports = class YouTube {

    constructor(oauth2Client = null, user = 'createam', socket_io = null) {
        this.oauth2Client = oauth2Client ? oauth2Client : new OAuth2Client(
            clientConfig.client_id,
            clientConfig.client_secret,
            clientConfig.redirect_uris[0]
        );
        console.log("oauth2Client",oauth2Client, this.oauth2Client)
        this.user = user;
        this.socket_io = socket_io
    }

    /**
     * if we want to change users
     */
    setUser(user) {
        this.user = user;
    }

    /**
     * 
     */
    async authorize() {

        // Authorize a client with the loaded credentials, then call the YouTube API.
        return new Promise(async (resolve, reject) => {
            const tokenManager = new TokensManager(this.user)
            const response = await tokenManager.retriveTokens();

            if (response.error) {

                logYoutube('Error while trying to retrieve access token', response.error);
                reject({ success: false, error: response.error })

            }
            console.log("oauth2Client",this.oauth2Client)
            const tokens = response.res;
            // const self = this;
            this.oauth2Client = await Youtube.authenticate({
                type: "oauth",
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                client_id: this.oauth2Client._clientId,
                client_secret: this.oauth2Client._clientSecret,
                redirect_url: this.oauth2Client.redirectUri
            });
            // console.log("o2c",o2c)
            // this.oauth2Client = o2c;
            this.oauth2Client.setCredentials(tokens);
            // refresh tokens so esperation date updates
            this.oauth2Client.refreshAccessToken(function (err, rtokens) {

                if (err) {
                    logYoutube('Error while trying to retrieve access token', err);
                    reject({ success: false, error: err })
                } else {
                    console.log("hereeee,rtoken", rtokens)
                    resolve({ success: true })
                }
            });
        });



    }


    /**
    * upload video stream to app youtube account.
    * 
    * @param {Object} data the video data to upload sent in request
    */

    async insertVideo(data) {
        let handle = null;

        const baseFileDirPath = process.env.NODE_ENV == 'production' ? 'build' : 'public';
        const baseFilePath = path.join(__dirname, '../../../../../') // videos stored in PROJECT_NAME/public
        const videoPath = baseFilePath + `${baseFileDirPath}/${videoFolder}/${data.videoPath}`;
        return new Promise((resolve, reject) => {
            var req = Youtube.videos.insert({
                resource: {
                    auth: this.oauth2Client,
                    snippet: {
                        title: data.title,
                        description: data.description
                    },
                    status: {
                        privacyStatus: "unlisted"
                    }
                },
                // This is for the callback function
                part: "snippet,status",
                fields: "id,etag,snippet/channelId",

                // Create the readable stream to upload the video
                media: {
                    body: fs.createReadStream(videoPath)
                }
            }, (err, response) => {
                logYoutube("DONE!!!")
                clearInterval(handle)
                handle = 0;
                if (err) {
                    reject({ success: false, error: err })
                }
                else {
                    resolve({ success: true, res: response });
                }
            });
            var socket_io = this.socket_io;
            handle = setInterval(function () {
                if (socket_io) socket_io.to(data.roomName).emit('uploading', { bytes: req.req.connection._bytesDispatched });
                console.log(`${prettyBytes(req.req.connection._bytesDispatched)} bytes uploaded.`);
            }, 250);
        });
    }

}




