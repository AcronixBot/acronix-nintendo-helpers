import fetch from 'node-fetch';
import { randomBytes, createHash, BinaryLike } from 'crypto';

export const clientId = '71b963c1b7b6d119';

export const toUrlSafeBase64Encode = (val: Buffer) => {
    return val.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

export const buildQuery = (params: { [x: string]: any; hasOwnProperty: (arg0: string) => any; }) => {
    let r = '';
    for (let i in params) {
        if (params.hasOwnProperty(i)) {
            r += (String(i) + '=' + String(params[i]) + '&');
        }
    }
    r = r.replace(/&$/, '');
    return r;
};

export async function to(promise: any) {
    try {
        const data = await Promise.resolve(promise);
        return [null, data];
    } catch (err) {
        return [err];
    }
}

export const generateAuthCodeVerifier = () => {
    return toUrlSafeBase64Encode(randomBytes(32));
};

export const generateAuthUri = (authCodeVerifier: BinaryLike) => {

    // Check parameter
    if (typeof authCodeVerifier === 'undefined') {
        throw { message: 'The authCodeVerifier parameter was omitted' };
    }

    // Prepare
    const baseUrl = 'https://accounts.nintendo.com/connect/1.0.0/authorize';

    const state = toUrlSafeBase64Encode(randomBytes(36));

    const authCvHash = createHash('sha256');
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

export const getSessionTokenCode = (redirectUrl: string) => {
    let arr = redirectUrl.match(/session_token_code=(.*)&/);
    if (!arr || !arr[1]) {
        throw {
            message: 'Badly formed redirect URL',
            original: redirectUrl
        }
    }
    return arr[1];
};

export const getSessionToken = async (sessionTokenCode: string, authCodeVerifier: string): Promise<string> => {

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