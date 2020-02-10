'use strict';
const logUser = require('debug')('model:user');
const randomstring = require("randomstring");
const https = require('https');
module.exports = app => {
    app.post('/fbcallback', async (req, res, next) => {

        try {
            const userData = req.body.data;
            console.log(userData.userID);
            console.log(userData.accessToken);
            let url = `https://graph.facebook.com/${userData.userID}?fields=id,name,email,picture&access_token=${userData.accessToken}`;
            console.log("url is", url);
            https.get(url,
                (resp) => {
                    let data = '';

                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                        try {
                            data += chunk;
                        }
                        catch (err) {
                            console.log("catching err:\n", err, "\n");
                            return next({});
                        }

                    });

                    // The whole response has been received. 
                    resp.on('end', async () => {
                        try {
                            console.log(data);
                            const realData = JSON.parse(data);                  
                            if(realData.error){
                                console.log("error by url");
                                return next({});
                            }
                            var userRoleId;
                            let userRole = await app.models.Role.findOne({ where: { name: "SIMPLEUSER" } });
                            //Searching SIMPLEUSER id in the database 
                            if (userRole) {
                                userRoleId = userRole.id;
                            } else {
                                return next({});
                            }
                            let user = await app.models.CustomUser.findOne({ where: { email: realData.email } });
                            if (user && (!realData.email || !realData.name )) {
                                //a case of a user spoofing.
                                console.log("HACK ATTEMP in facebook login");
                                return next({});
                            }
                            let userInfoForDb = { // The information I save in the database
                                email: realData.email,
                                realm: realData.name,
                                username: realData.email,
                                loginId: realData.id
                            };
                            console.log(userInfoForDb);
                            app.models.CustomUser.registerOrLoginByUniqueField('loginId', userInfoForDb, userRoleId, (err, at) => {
                                //here- save the profile picture.
                                if (err) {
                                    console.log("err in fb:", err)
                                    return next({});
                                }
                                console.log("Success creating access_token for facebook login:", at, "\n");
                                res.cookie('access_token', at.id, { signed: true, maxAge: 1000 * 60 * 60 * 5 });
                                res.cookie('kl', at.__data.kl, { signed: false, maxAge: 1000 * 60 * 60 * 5 });
                                res.cookie('klo', at.__data.klo, { signed: false, maxAge: 1000 * 60 * 60 * 5 });
                                res.cookie('kloo', randomstring.generate(), { signed: true, maxAge: 1000 * 60 * 60 * 5 });
                                res.cookie('klk', randomstring.generate(), { signed: true, maxAge: 1000 * 60 * 60 * 5 });
                                res.cookie('olk', randomstring.generate(), { signed: true, maxAge: 1000 * 60 * 60 * 5 });
                                res.send({ "success": true })
                            }, null , [], 1209600);
                        }
                        catch (err) {
                            console.log("catching err:\n", err, "\n");
                            return next({});
                        }

                    });


                })
                .on("error", (err) => {
                    console.log("catching err:\n", err, "\n");
                    return next({})
                })

        }
        catch (err) {
            console.log("catching err:\n", err, "\n");
            return next({});
        }
    });
}


