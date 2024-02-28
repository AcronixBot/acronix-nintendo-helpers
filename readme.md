The basic building block of this code is from [TomikaArome](https://github.com/TomikaArome/splatnet2-cookie-node) so most of the credit goes to this user. 


To execute the code, min. Node.js `19.0.0` must be installed.

Install the packages with
```sh
npm install
``` 
To get JavaScript Code we need to run a build command
```sh
npm run build
```
Now we can run the JavaScript Code
```sh
npm run start
```

Big thanks also to [nxapi](https://github.com/samuelthomas2774/nxapi), without this package none of this would be possible so easy.

Overview of the files that will be created
- `authURI.txt` -> containing the url from which you get the redirect url 
- `sessionToken.txt` -> containing the Session Token
- `accessToken.txt` -> containing the accessToken (also known as gtoken or webservice token)
- `bulletToken.txt` -> containing the BulletToken

If you want to know more about how it all works, please read on here: [https://splatnet3-scraper.readthedocs.io/en/latest/index.html](https://splatnet3-scraper.readthedocs.io/en/latest/index.html)

For help, you can join the Disord Server: https://discord.gg/sj3ZTNn9d7 or open an issue
