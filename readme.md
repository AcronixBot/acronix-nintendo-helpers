The basic building block of this code is from [TomikaArome](https://github.com/TomikaArome/splatnet2-cookie-node) so most of the credit goes to this user. 
However, I have modified the code so that it only generates the SessionToken at the current moment. 
In the future, it should also be possible to generate the WebServiceToken and the BulletToken for the SplatNet3 app.


To execute the code, min. Node.js `19.0.0` must be installed.

Install the packages with
```sh
npm install
``` 
Start it with 
```sh
node index.js
```

Big thanks also to [nxapi](https://github.com/samuelthomas2774/nxapi), without this package none of this planned would be possible.

Overview of the files that will be created
- `authURI.txt` -> containing the url from which you get the redirect url 
- `sessionToken.txt` -> containing the Session Token