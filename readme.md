# Bump Clone (Kinda) - WIP

A simple clone of [bu.mp](https://blog.bu.mp) which used to be an app to send data between two devices using a simple "bump" gesture.

Implemented with SvelteKit, Pocketbase and Inngest.

Improvements needed:
- Rework the matching such that it uses the realtime feature in pocketbase
- Better physical bumps such that you don't need to buy an new phone each time you want to test
- Make a docker container instead

Guide to run:
- Download Pocketbase (https://pocketbase.io/docs/)
- Place the downloaded file in the root directory
- If you dont have it installed then install `mkcert` (https://github.com/FiloSottile/mkcert) and run `mkcert -install`
- In the `/certs/` folder create an certificate with `mkcert bump.com localhost`
- Add an `.env` file in `/web/` with the following format
```
TLS_KEY=../certs/PATH_TO_PEM-key.pem
TLS_CERT=../certs/PATH_TO_PEM.pem
ADMIN_EMAIL=ADMIN_EMAIL_IN_POCKETBASE
ADMIN_PASSWORD=ADMIN_PASSWORD_IN_POCKETBASE
```
- Open one terminal and write `./pocketbase serve` and setup an admin user if it is the first time
- In an new terminal run `npx inngest-cli@latest dev -u https://localhost:5173/api/inngest#` which opens the Inngest server on `http://localhost:8288`
- In another new terminal open the `/web/` folder and run `npm run dev`