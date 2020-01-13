'use strict';
const path = require('path');
const YouTube = require('../lib/YouTube');

const to = (promise) => {
    return promise.then(data => {
        return [null, data];
    })
        .catch(err => [err]);
}

const fs = require('fs');
const logYoutube = require('debug')('model:youtube');
const folder = 'videos';

module.exports = function YoutubeHandler(Model, options) {
    const funcName = options.funcName;
    Model.afterRemote(funcName, async function (ctx, modelInstance, next) {
        logYoutube("Model.afterRemote(*) is launched");
        if (ctx.req.method !== "POST" && ctx.req.method !== "PUT" /*&& !modelInstance.id*/)
            return next();

        let userId = (ctx.args.options && ctx.args.options.accessToken) ?
            ctx.args.options.accessToken.userId : //if there's accessToken use userId
            (Model === Model.app.models.CustomUser ? //else, if we are creating new user use new user's id
                modelInstance.id :
                null);

        //Access is always restricted without authentication
        if (!userId) { return next(); }
        const socket_io = Model.app.io; //we use socket_io it to send uploading progress back to client
        const youtube = new YouTube(null, userId, socket_io);
        const response = await youtube.authorize();
        if (!response || !response.success) {
            logYoutube('Authorization for youtube faild, aborting....')
            return next();
        }

        let args = ctx.args;

        (async () => {
            const argsKeys = Object.keys(args);

            for (let i = 0; i < argsKeys.length; i++) { // we are not using map func, because we cannot put async inside it.

                let field = argsKeys[i];
                logYoutube("Iterating with field (%s)", field);

                if (field === "options") continue;
                if (!args[field] || !args[field].fileToUpload) return next();

                let fileToUpload = args[field].fileToUpload;
                const user = fileToUpload.user;
                if (user) youtube.setUser(user);
                const responses = await youtube.insertVideo(fileToUpload);
                if (!responses || !responses.success) {
                    logYoutube('Uploading file to youtube returned with error, aborting...', response.err)
                    continue;
                }
                else {
                    const key = fileToUpload.key;
                    const value = response.res.snippet.channleId;
                    // Updating the row to include the id of the file added
                    let [upsertErr, upsertRes] = await to(Model.upsertWithWhere(
                        { id: modelInstance.id }, { [key]: value }
                    ));
                    logYoutube("Updated model with key,val:%s,%s", key, value);

                    if (upsertErr) { console.error(`error upserting field "${key}", aborting...`, upsertErr); continue; }
                }
            }
            return next();
        })();
    });
}




