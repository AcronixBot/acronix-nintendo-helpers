const fs = require('fs');
const readline = require('readline');
const fetch = require('node-fetch');
const crypto = require('crypto');
const uuidv4 = require('uuid').v4;
/*-----------*
 | Constants |
 *-----------*/

const version = "1.0.3";
const clientId = '71b963c1b7b6d119';
const availableLanguages = ['en-US', 'es-MX', 'fr-CA', 'ja-JP', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'nl-NL', 'ru-RU'];

let userAgent = null;

/*-------------------*
 | Utility functions |
 *-------------------*/

const toUrlSafeBase64Encode = (val) => {
    return val.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

const buildQuery = (params) => {
    let r = '';
    for (let i in params) {
        if (params.hasOwnProperty(i)) {
            r += (String(i) + '=' + String(params[i]) + '&');
        }
    }
    r = r.replace(/&$/, '');
    return r;
};

const to = (promise) => {
    return Promise.resolve(promise).then(data => {
        return [null, data];
    }).catch(err => [err]);
};

// Additional require for command line only
const askQuestion = (query) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
};

/*-------------------*
 | Package functions |
 *-------------------*/

const generateAuthCodeVerifier = () => {
    return toUrlSafeBase64Encode(crypto.randomBytes(32));
};

const generateAuthUri = (authCodeVerifier) => {

    // Check parameter
    if (typeof authCodeVerifier === 'undefined') {
        throw { message: 'The authCodeVerifier parameter was omitted' };
    }

    // Prepare
    const baseUrl = 'https://accounts.nintendo.com/connect/1.0.0/authorize';

    const state = toUrlSafeBase64Encode(crypto.randomBytes(36));

    const authCvHash = crypto.createHash('sha256');
    authCvHash.update(authCodeVerifier);
    const authCodeChallenge = toUrlSafeBase64Encode(authCvHash.digest());

    // Parameters
    let params = {
        'state': state,
        'redirect_uri': 'npf71b963c1b7b6d119://auth',
        'client_id': clientId,
        'scope': 'openid user user.birthday user.mii user.screenName',
        'response_type': 'session_token_code',
        'session_token_code_challenge': authCodeChallenge,
        'session_token_code_challenge_method': 'S256',
        'theme': 'login_form'
    };
    let query = buildQuery(params);

    return `${baseUrl}?${query}`;

};

const getSessionTokenCode = (redirectUrl) => {
    let arr = redirectUrl.match(/session_token_code=(.*)&/);
    if (!arr || !arr[1]) {
        throw {
            message: 'Badly formed redirect URL',
            original: redirectUrl
        }
    }
    return arr[1];
};

const getSessionToken = async (sessionTokenCode, authCodeVerifier) => {

    // ---- STEP 1 ----
    // Get session_token from Nintendo

    const step1Url = 'https://accounts.nintendo.com/connect/1.0.0/api/session_token';
    let step1Head = {
        'User-Agent': 'OnlineLounge/1.11.0 NASDKAPI Android',
        'Accept-Language': 'en-US',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': '540',
        'Host': 'accounts.nintendo.com',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip'
    };
    let step1Params = {
        'client_id': clientId,
        'session_token_code': sessionTokenCode,
        'session_token_code_verifier': authCodeVerifier
    };

    let [step1Err, step1Res] = await to(fetch(step1Url, {
        method: 'POST',
        headers: step1Head,
        body: buildQuery(step1Params)
    }));
    if (step1Err) {
        throw {
            message: 'The request when attempting to retrieve the session_token failed',
            original: step1Err
        };
    }
    let [step1JsonErr, step1Json] = await to(step1Res.json());
    if (step1JsonErr) {
        throw {
            message: 'The JSON retrieved from the session_token request could not be parsed',
            original: step1JsonErr
        };
    }

    if (typeof step1Json.session_token === 'undefined') {
        throw {
            message: 'Couldn\'t get the session token from Nintendo',
            original: step1Json
        };
    }
    return step1Json.session_token;

};




/*--------------*
 | Command line |
 *--------------*/

(async () => {

    // Check if the script was called directly and hasn't been imported using require()
    if (require.main !== module || !process || !process.argv || !process.argv[0] || !process.argv[1]) { return 0; }

    try {

        // Init
        console.log(`splatnet2-cookie-node version ${version}\n----------`);

        // Language
        let userLangInput = await askQuestion(`Input a language from the following list: (Default: en-GB)
  Games purchased in North America:                    en-US, es-MX, fr-CA
  Games purchased in Japan:                            ja-JP
  Games purchased in Europe, Australia or New Zealand: en-GB, es-ES, fr-FR, de-DE, it-IT, nl-NL, ru-RU\n`);
        if (userLangInput === '') { userLangInput = 'en-GB'; }
        else if (availableLanguages.indexOf(userLangInput) === -1) {
            console.log('----------\nInvalid language. Exiting');
            return 0;
        }

        // Generate auth uri
        let authCodeVerifier = generateAuthCodeVerifier();
        let url = generateAuthUri(authCodeVerifier);
        console.log(`Copy and paste the following URL to your browser to login:\n----------\n${url}\n----------`);
        try {
            fs.writeFileSync('authURI.txt', url);
            console.log('The URL has been saved to authURI.txt for ease of access');
        } catch (writeErr) {
            console.error('Error trying to write the URL to authURI.txt');
        }

        // Redirect URL / session token code
        let redirectUrlInput = await askQuestion('----------\nInput the redirect URL obtained by right clicking on "Select this person" and pressing "Copy link address":\n');
        console.log('----------');
        let sessionTokenCode = getSessionTokenCode(redirectUrlInput);

        // Run
        let sessionToken = await getSessionToken(sessionTokenCode, authCodeVerifier);
        if (sessionToken) {
            console.log(`sessionToken generated:\n----------\n${sessionToken}\n----------`)
            try {
                fs.writeFileSync('sessionToken.txt', sessionToken);
                console.log('The sessionToken has been saved to sessionToken.txt for ease of access');
            } catch (writeErr) {
                console.error('Error trying to write the sessionToken to sessionToken.txt');
            }
        }


    } catch (err) {
        console.error(err);
        return 0;
    }
    return 1;

})().catch((error) => {
    console.error(error);
});
