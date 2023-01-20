# Bump Clone (Kinda)

A simple clone of [bu.mp](bu.mp) which used to be an app to send data between two devices using a simple "bump" gesture.

Implemented with SvelteKit and Pocketbase.

Guide to run:
- Download Pocketbase (https://pocketbase.io/docs/)
- Place the downloaded file in the root directory
- If you dont have it installed then install `mkcert` (https://github.com/FiloSottile/mkcert) and run `mkcert -install`
- In the `/certs/` folder create an certificate with `mkcert bump.com localhost`
- Add an `.env` file in `/web/` with the following format
```
TLS_KEY=../certs/PATH_TO_PEM-key.pem
TLS_CERT=../certs/PATH_TO_PEM.pem
```
- Open one terminal and write `./pocketbase serve` and setup an admin user if it is the first time
- In an new terminal open the `/web/` folder and run `npm run dev`