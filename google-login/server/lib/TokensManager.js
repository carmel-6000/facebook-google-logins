var fs = require('fs');
var path = require('path');
var logGoogle = require('debug')('model:google');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/createam-google.json

const fullFilePath = path.join(__dirname, '../', 'config');
const TOKEN_DIR = fullFilePath + '/.credentials/';

const NO_FILE = "file not found";
const PARSE_TOKENS = 'parsing tokens error'


module.exports = class TokensManager {

    constructor(user = 'createam') {
        this.user = user;
    }

    /**
     * 
     */
    async retriveTokens() {

        const token_path = TOKEN_DIR + this.user + '-google.json';
        // Check if we have previously stored a token.
        return new Promise((resolve, reject) => {
            fs.readFile(token_path, async function (err, token) {
                if (err) {
                    logGoogle("err read file", err)
                    reject({ success: false, error: NO_FILE })
                } else {
                    try {
                        let tokens = JSON.parse(token);
                        resolve({ success: true, res: tokens })

                    } catch (err) {
                        logGoogle("Parse tokens from files err", err)
                        reject({ success: false, error: PARSE_TOKENS })
                    }
                }
            });
        });

    }

    /**
     * Store token to disk be used in later program executions.
     *
     * @param {Object} token The token to store to disk.
     * @param {String} token_path The path to store tokens on disk.
     */
    async storeToken(token, token_path = null) {
        return new Promise((resolve, reject) => {
            let path = token_path ? token_path : TOKEN_DIR + this.user + '-google.json';
            try {
                if (!fs.existsSync(TOKEN_DIR)) {
                    fs.mkdirSync(TOKEN_DIR);
                }
            } catch (err) {
                reject({ success: false, error: err });
            }

            fs.writeFileSync(path, JSON.stringify(token));
            logGoogle('Token stored to ' + path);
            resolve({ success: true })
        })

    }

}
