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
            console.log(access_token);
            if (!access_token) {
                return res.send({ success: false, invalidUser: true });
            }

            const urlForUserData = `https://graph.facebook.com/me?fields=email,picture,name&access_token=${access_token}`;

            const userData = await urlFetch(urlForUserData);

            let realData = JSON.parse(userData);
            console.log("real data ", realData);
            let isEmailExist = false;
            let currentUser = null;
            if(realData.email){
                currentUser = await app.models.CustomUser.findOne({ where: { email: realData.email } });
                if(currentUser){
                    isEmailExist = true;
                }
            }
            let uniqueField = "email";
            let updateFields = ['email'];
            const ExistUser = await app.models.CustomUser.findOne({ where: { loginId: realData.id } });
            if(ExistUser){
                uniqueField = "loginId";
            }

            if(ExistUser && currentUser){
                if(ExistUser.id !== currentUser.id){
                    updateFields = [];
                }
            }
            
            if (!realData) {
                return res.send({ success: false, invalidUser: true });
            }
            else if (!realData.email) {
                if (!ExistUser) {
                    let maxCount = 100;
                    let uniqueEmail = false;
                    let currentTry = 0;
                    let email = "";
                    while (maxCount > currentTry && !uniqueEmail) {
                        email = randomstring.generate() + "@alyn-safecards.com";
                        let emailUser = await app.models.CustomUser.findOne({ where: { email: email } });
                        if (!emailUser) {
                            uniqueEmail = true;
                        }
                    }
                    if (uniqueEmail) {
                        realData.email = email;
                    }
                    else {
                        return res.send({ success: false, error: true });
                    }
                }
            }
            else if (!realData.name) {
                return res.send({ success: false, missingName: true });
            }
            var userRoleId;
            let userRole = await app.models.Role.findOne({ where: { name: "SIMPLEUSER" } });
            //Searching SIMPLEUSER id in the database 
            if (userRole) {
                userRoleId = userRole.id;
            } else {
                return res.send({ success: false, error: true });
            }

            let userInfoForDb = { // The information I save in the database
                email: realData.email,
                realm: realData.name,
                username: realData.email,
                loginId: realData.id
            };
            app.models.CustomUser.registerOrLoginByUniqueField(uniqueField, userInfoForDb, userRoleId, (err, at) => {
                //here- save the profile picture.
                if (err) {
                    console.log("err in fb:", err)
                    return res.send({ success: false, error: true });
                }
                let expires = new Date(Date.now() + (TWO_WEEKS * 1000));
                res.cookie('access_token', at.id, { signed: true, expires });
                res.cookie('kl', at.__data.kl, { signed: false, expires });
                res.cookie('klo', at.__data.klo, { signed: false, expires });
                res.cookie('kloo', randomstring.generate(), { signed: true, expires });
                res.cookie('klk', randomstring.generate(), { signed: true, expires });
                res.cookie('olk', randomstring.generate(), { signed: true, expires });

                return res.send({ success: true });

            }, null, updateFields, TWO_WEEKS);
        }
        catch (err) {
            console.log("catching err:\n", err, "\n");
            return res.send({ success: false, error: true });
        }
    });
}


