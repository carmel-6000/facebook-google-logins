'use strict';
require('dotenv').config();
const logUser = require('debug')('model:user');
const randomstring = require("randomstring");
const https = require('https');


const secret = require("../config/secret.json");

const APP_ID = secret.app_id;
const APP_SECRET = secret.app_secret;
const TWO_WEEKS = 60 * 60 * 24 * 14;

function urlFetch(url) {
    return new Promise((resolve, reject) => {
        let data = "";
        https.get(url, res => {
            res.on("data", chunk => {
                data += chunk;
            });

            res.on("end", () => {
                resolve(data);
            });

            res.on("error", (err) => {
                reject(err);
            })
        }).on("error", err => {
            reject(err);
        })
    });
}

module.exports = app => {
    app.get('/fbcallback', async (req, res) => {
        try {

            // const state = JSON.parse(req.query.state);
            // if (req.query.error) {
            //     return res.redirect(state.failUrl);
            // }
            // if (!state.failUrl) state.failUrl = process.env.REACT_APP_DOMAIN ? process.env.REACT_APP_DOMAIN + "/" : "http://hilma.tech";
            // if (!state.successUrl) state.successUrl = process.env.REACT_APP_DOMAIN ? process.env.REACT_APP_DOMAIN + "/" : "https://www.hilma.tech";
            // const urlForAt = `https://graph.facebook.com/v6.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${process.env.REACT_APP_SERVER_DOMAIN}/fbcallback/&client_secret=${APP_SECRET}&code=${req.query.code}`;

            // const dataWithAt = await urlFetch(urlForAt);

            // const { access_token } = JSON.parse(dataWithAt);
            let { access_token } = req.query;
            if (!access_token) {
                res.send({ success: false });
            }

            const urlForUserData = `https://graph.facebook.com/me?fields=email,picture,name&access_token=${access_token}`;

            const userData = await urlFetch(urlForUserData);

            const realData = JSON.parse(userData);
            var userRoleId;
            let userRole = await app.models.Role.findOne({ where: { name: "SIMPLEUSER" } });
            //Searching SIMPLEUSER id in the database 
            if (userRole) {
                userRoleId = userRole.id;
            } else {
                res.send({ success: false });
            }


            let user = await app.models.CustomUser.findOne({ where: { email: realData.email } });
            if (user && (!realData.email || !realData.name)) {
                //a case of a user spoofing.
                console.log("HACK ATTEMP in facebook login");
                res.send({ success: false });
            }
            let userInfoForDb = { // The information I save in the database
                email: realData.email,
                realm: realData.name,
                username: realData.email,
                loginId: realData.id
            };
            app.models.CustomUser.registerOrLoginByUniqueField('loginId', userInfoForDb, userRoleId, (err, at) => {
                //here- save the profile picture.
                if (err) {
                    console.log("err in fb:", err)
                    res.send({ success: false });
                }
                let expires = new Date(Date.now() + (TWO_WEEKS * 1000));
                res.cookie('access_token', at.id, { signed: true, expires });
                res.cookie('kl', at.__data.kl, { signed: false, expires });
                res.cookie('klo', at.__data.klo, { signed: false, expires });
                res.cookie('kloo', randomstring.generate(), { signed: true, expires });
                res.cookie('klk', randomstring.generate(), { signed: true, expires });
                res.cookie('olk', randomstring.generate(), { signed: true, expires });

                res.send({ success: true });

            }, null, [], TWO_WEEKS);
        }
        catch (err) {
            console.log("catching err:\n", err, "\n");
            try {
                res.send({ success: false });

            } catch (err) {
                res.send({ success: false });
            }
        }
    });
}


