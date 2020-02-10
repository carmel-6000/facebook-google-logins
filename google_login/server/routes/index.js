var logGoogle = require('debug')('model:google');

const TokensManager = require('../lib/TokensManager')
const clientConfig = require('../config/client_secret.json');

const randomstring = require("randomstring");
const url = require('url');

const { OAuth2Client } = require('google-auth-library');

const YouTube = require('../lib/YouTube');


const errors = {
    NO_CODE: 'ERROR: Missing query arg code',
    NO_BODY: 'ERROR: Missing request body',
    NO_VIDEODATA: 'ERROR: Missing request video data',
    AUTHORIZATION_REQUIRED: 'ERROR: Authrization required'
}

const GOOGLE_ROLES = { none: 'SIMPLEUSER', ADMIN: 'ADIMN', SUPERADMIN: 'SUPERADMIN' };

module.exports = app => {


    const getTokenFromCallbackCode = async function (redirectUri, client) {

        try {
            let urlObject = url.parse(redirectUri, true)
            const code = urlObject.query.code;
            const tokenSet = await client.getToken(code)
            client.setCredentials(tokenSet.tokens);
            return tokenSet.tokens;
        } catch (error) {
            logGoogle("ERROR get token", error)
        }

    }

    const fetchUserInfo = async function (redirectedUrl, client) {

        let userInfo = null;

        try {
            const tokens = await getTokenFromCallbackCode(redirectedUrl, client)

            const ticket = await client.verifyIdToken({
                idToken: tokens.id_token,
                audience: clientConfig.web.client_id  // Specify the client_id of the app that accesses the backend
            });
            userInfo = ticket.getPayload();

            return [userInfo, tokens]
        } catch (error) {
            logGoogle("ERROR verify token", error)
        }

    }

    // get user info from oauth2client and login/regester user to system
    // using unique feild sub - The unique ID of the user's Google Account
    app.get('/oauth2callback', async (req, res) => { //michael work here

        console.log("res query", req.query.scope)


        if (!req.query.code) {
            logGoogle(errors.NO_CODE);
            res.send({ succes: 0, error: errors.NO_CODE })
            return;
        }

        const client = new OAuth2Client(
            clientConfig.web.client_id,
            clientConfig.web.client_secret,
            clientConfig.web.redirect_uris[0]
        );

        const state = JSON.parse(req.query.state);
        let failureUrl = state.failUrl ? state.failUrl : "https://www.hilma.tech/";

        try {



            console.log("state", req.query.state)

            if (state.role == GOOGLE_ROLES.ADMIN || state.rolo == GOOGLE_ROLES.SUPERADMIN) {
                logGoogle('YOU CANT HAVE THESE ROLES FOR GOOLE. Aborting login');
                res.redirect(failureUrl/*clientConfig.javascript_origins[0]*/);//todo check 
            }
            const redirectedUrl = req.protocol + '://' + req.get('host') + req.originalUrl
            let [userInfo, tokens] = await fetchUserInfo(redirectedUrl, client);

            console.log("USER INFO", userInfo)


            if (!userInfo) {
                logGoogle('No data was fetched from google. Aborting login');
                res.redirect(failureUrl);//todo
            }

            let redirectUrl = state.loc ? state.loc : "https://www.hilma.tech/";

            // todo- check if there is another identifing data
            // maybe- change sub to loginId
            let userInfoForDb = {
                email: userInfo.email,
                realm: userInfo.name,
                username: userInfo.email,
                loginId: userInfo.sub,
            };


            let rolesToFind = [GOOGLE_ROLES.none, state.role];
            let userRole, relevantRoles = await app.models.Role.find({ where: { name: { inq: rolesToFind } } }); //we dont use here findOne because it might give us the simpleuser instead of other role.
            logGoogle("try find roles: ", relevantRoles);
            if (relevantRoles.length === 1) userRole = relevantRoles[0].id;
            else if (relevantRoles.length) {
                userRole = relevantRoles.find(item => item.name.toLowerCase() === rolesToFind[1].toLowerCase()).id;
            }
            else {
                console.log("\nYOU MUST HAVE THESE ROLES FOR Login, DUDE:" + state.role + " , or at least SIMPLEUSER.\n");
                return res.redirect(failureUrl);//todo
            }

            logGoogle("role we try:", userRole);

            app.models.CustomUser.registerOrLoginByUniqueField('loginId', userInfoForDb, userRole, async (err, at) => {
                if (err) {
                    res.redirect(failureUrl);
                    return;
                }
                logGoogle("back with from registerOrLoginByUniqueField for google login with?", at, "\n\n");

                if (state.mt_bool) {
                    const tokensManager = new TokensManager(at.userId);
                    await tokensManager.storeToken(tokens);
                }

                res.cookie('access_token', at.id, { signed: true, maxAge: 1000 * 60 * 60 * 5 });
                res.cookie('kl', at.__data.kl, { signed: false, maxAge: 1000 * 60 * 60 * 5 });
                res.cookie('klo', at.__data.klo, { signed: false, maxAge: 1000 * 60 * 60 * 5 });

                res.cookie('kloo', randomstring.generate(), { signed: true, maxAge: 1000 * 60 * 60 * 5 });
                res.cookie('klk', randomstring.generate(), { signed: true, maxAge: 1000 * 60 * 60 * 5 });
                res.cookie('olk', randomstring.generate(), { signed: true, maxAge: 1000 * 60 * 60 * 5 });
                res.cookie('lang', userInfo.locale, { signed: false, maxAge: 1000 * 60 * 60 * 5 });
                res.redirect(redirectUrl)


            });

        } catch (err) {
            logGoogle("err in google callback route", err);
            res.redirect(failureUrl);
        }


    });


    app.get('/ytoauth2callback', async (req, res) => {

        if (!req.query.code) {
            logGoogle("Missing query arg code");
            res.redirect('/');
            return;
        }

        if (!req.query.state) {
            logGoogle("Missing query arg state - unique_id");
            res.redirect('/');
            return;
        }

        const client = new OAuth2Client(
            clientConfig.web.client_id,
            clientConfig.web.client_secret,
            clientConfig.web.redirect_uris[1] //to
        );
        // const YouTube = require('../lib/YouTube');

        const unique_id = req.query.state;
        const youtube = new YouTube(client, unique_id, app.io)

        try {

            const redirectUrl = req.protocol + '://' + req.get('host') + req.originalUrl
            const tokens = await getTokenFromCallbackCode(redirectUrl, client)

            await youtube.storeToken(tokens)

            // let [upsertErr, upsertRes] = await to(model.upsertWithWhere(
            //     { unique_id }, { [field]: 1 }
            // ));
            // if (upsertErr) {
            //     logGoogle('Error update attribute, aborting....');
            //     res.redirect('/')
            // }

            const redir = '/';  //TODO make it createam and not localhost
            res.redirect(redir)

        } catch (err) {
            logGoogle("err in youtube callback route", err);
            res.redirect('/');
        }

    });


    app.post('/uploadToYoutube', async (req, res) => {


        if (!req.body) {
            res.send({ success: false, err: errors.NO_BODY })
            return;
        }

        if (!req.body.videoData) {
            res.send({ success: false, err: errors.NO_VIDEODATA })
            return;
        }

        const user = req.body.user ? req.body.user : req.accessToken.userId
        const youtube = new YouTube(null, user, app.io)

        const response = await youtube.authorize();
        // res.send({ success: true, res: "testing" })
        // return;
        if (!response || !response.success) {
            console.log("responses", response)
            res.send({ success: false, err: errors.AUTHORIZATION_REQUIRED })
            return;
        }

        const data = req.body.videoData
        const responses = await youtube.insertVideo(data);
        if (!responses || !responses.success) {
            res.send({ success: false, err: responses.err })
            return;
        }
        res.send({ success: true, res: responses.res })

    })

}
