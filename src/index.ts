import { writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { generateAuthCodeVerifier, generateAuthUri, getSessionToken, getSessionTokenCode } from './SessionToken.js';
import { createCoral, getBulletToken, WebViewVersion } from './WebService.js';

const version = "1.0.4";
const availableLanguages = ['en-US', 'es-MX', 'fr-CA', 'ja-JP', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'nl-NL', 'ru-RU'];

// Additional require for command line only
// const askQuestion = (query: string) => {
//     const rl = createInterface({ input: process.stdin, output: process.stdout });
//     return new Promise(resolve => rl.question(query, ans => {
//         rl.close();
//         resolve(ans);
//     }));
// };
async function askQuestion(query: string): Promise<string> {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}


(async () => {

    try {

        // Init
        console.log(`acronix-nintendo-helper version ${version}\n----------`);

        // Language
        let userLangInput = await askQuestion(`Input a language from the following list: (Default: en-GB)
  Games purchased in North America:                    en-US, es-MX, fr-CA
  Games purchased in Japan:                            ja-JP
  Games purchased in Europe, Australia or New Zealand: en-GB, es-ES, fr-FR, de-DE, it-IT, nl-NL, ru-RU\n`) as string;
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
            writeFileSync('data_authURI.txt', url);
            console.log('The URL has been saved to data_authURI.txt for ease of access');
        } catch (writeErr) {
            console.error('Error trying to write the URL to data_authURI.txt');
        }

        // Redirect URL / session token code
        let redirectUrlInput = await askQuestion('----------\nInput the redirect URL obtained by right clicking on "Select this person" and pressing "Copy link address":\n') as string;
        console.log('----------');
        let sessionTokenCode = getSessionTokenCode(redirectUrlInput);

        // Run
        let sessionToken = await getSessionToken(sessionTokenCode, authCodeVerifier);
        if (sessionToken) {
            console.log(`sessionToken generated:\n----------\n${sessionToken}\n----------`)
            try {
                writeFileSync('data_sessionToken.txt', sessionToken);
                console.log('The sessionToken has been saved to data_sessionToken.txt for ease of access');
            } catch (writeErr) {
                console.error('Error trying to write the sessionToken to data_sessionToken.txt');
            }
        }

        let accessToken = await createCoral(sessionToken);
        if (accessToken) {
            console.log(`accessToken generated:\n----------\n${accessToken}\n----------`)
            try {
                writeFileSync('data_accessToken.txt', accessToken);
                console.log('The accessToken has been saved to data_accessToken.txt for ease of access');
            } catch (writeErr) {
                console.error('Error trying to write the accessToken to data_accessToken.txt');
            }
        }

        let BulletTokenData = await getBulletToken(accessToken, WebViewVersion)
        if (BulletTokenData) {
            console.log(`BulletTokenData generated:\n----------\n${JSON.stringify(BulletTokenData.bulletToken)}\n----------`)
            try {
                writeFileSync('data_bulletToken.txt', BulletTokenData.bulletToken);
                console.log('The BulletTokenData has been saved to data_bulletToken.txt for ease of access');
            } catch (writeErr) {
                console.error('Error trying to write the BulletTokenData to data_bulletToken.txt');
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