import CoralApi from 'nxapi/coral'
import { addUserAgent } from 'nxapi'

export const UserAgent = 'acronixNintendoHelper/1.0.0 (+https://github.com/Voroniyx/acronix-nintendo-helpers)'
export const SPLATNET3_WEB_SERVICE_ID = "4834290508791808";
export const WebViewVersion = '3.0.0-6049221b';
export const BaseURL = 'https://api.lp1.av5ja.srv.nintendo.net/api/bullet_tokens'
export const baseAcceptLanguage = 'en-US'
/**
 * returns the accessToken
 * @param {String} sessionToken 
 */
export async function createCoral(sessionToken) {
    addUserAgent(UserAgent);

    let { data } = await CoralApi.createWithSessionToken(sessionToken);

    let coral = CoralApi.createWithSavedToken(data);

    let { accessToken } = await coral.getWebServiceToken(SPLATNET3_WEB_SERVICE_ID)

    return accessToken
}

/**
 * 
 * @param {String} sessionToken 
 * @param {String} WebViewVersion 
 */
export async function getBulletToken(sessionToken, WebViewVersion) {
    let response = await fetch(BaseURL, {
        method: 'POST',
        headers: {
            'X-Web-View-Ver': WebViewVersion,
            'X-NACOUNTRY': 'US',
            'X-GameWebToken': sessionToken,
            'Accept-Language': baseAcceptLanguage,
        }
    })

    if(!response.ok) {
        throw new Error(`Invalid bullet token response code: ${response.status}`);
    }

    let BulletTokenData = await response.json();

    return BulletTokenData;
}

