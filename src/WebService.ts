//@ts-ignore
import CoralApi from 'nxapi/coral'
import { addUserAgent } from 'nxapi'
//@ts-ignore
import * as pck from '../package.json' assert  {
    type: 'json',
};

export const UserAgent = `${pck.name}/${pck.version} (+${pck.github})`
export const SPLATNET3_WEB_SERVICE_ID = "4834290508791808";
export const WebViewVersion = '6.0.0-eb33aadc';
export const BaseURL = 'https://api.lp1.av5ja.srv.nintendo.net/api/bullet_tokens'
export const baseAcceptLanguage = 'en-US'

export async function createCoral(sessionToken: string): Promise<string> {
    addUserAgent(UserAgent);

    let { data } = await CoralApi.createWithSessionToken(sessionToken);

    let coral = CoralApi.createWithSavedToken(data);

    let { accessToken } = await coral.getWebServiceToken(SPLATNET3_WEB_SERVICE_ID)

    return accessToken
}

type BulletTokenResponse = {
    bulletToken: string,
    lang: string,
    is_noe_country: string
}

export async function getBulletToken(sessionToken: string, WebViewVersion: string): Promise<BulletTokenResponse> {
    let response = await fetch(BaseURL, {
        method: 'POST',
        headers: {
            'X-Web-View-Ver': WebViewVersion,
            'X-NACOUNTRY': 'US',
            'X-GameWebToken': sessionToken,
            'Accept-Language': baseAcceptLanguage,
        }
    })

    if (!response.ok) {
        throw new Error(`Invalid bullet token response code: ${response.status}`);
    }

    let BulletTokenData = await response.json();

    return BulletTokenData;
}
