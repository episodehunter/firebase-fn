import { join as pathJoin } from 'path';
import * as express from "express";
import * as cors from "cors";
import * as functions from "firebase-functions";
import { urlencoded } from 'body-parser';
import { get } from "./history";
import { updateTitles, getTitles } from "./titles";
import { auth } from "./firebase-app";
import { IncomingHttpHeaders } from "http";
import { onUserCreate } from "./auth";
import { isClientIdAndSecretValid, getRefreshToken, getAccessToken, getCustomToken, isClientIdValid, isRedirectUriValid } from "./oauth";

const app = express()
  .use(cors({ origin: true }))
  .use(urlencoded({ extended: false }))
  .get("/ping", (req, res) => res.send("Pong"))
  .get("/history", async (req, res) => {
    const uid = await getUserId(getToken(req.headers));
    if (!uid) {
      res.sendStatus(403);
    } else {
      try {
        const t0 = Date.now();
        const result = await get(uid, Math.min(req.query.page | 0, 0));
        res.set('Server-Timing', 'fb;desc="Firebase lookup";dur=' + (Date.now() - t0));
        res.send(result);
      } catch (error) {
        console.error(error);
        res.sendStatus(500);
      }
    }
  })
  .get("/updatetitles", async (req, res) => {
    try {
      res.send(await updateTitles());
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  })
  .get("/titles", async (req, res) => {
    try {
      res.send(await getTitles());
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  })
  .post("/auth", async (req, res) => {
    const clientId = req.body.client_id;
    const clientSecret = req.body.client_secret;
    const grantType = req.body.grant_type;

    if (!isClientIdAndSecretValid(clientId, clientSecret)) {
      console.error(`Wrong clientId or clientSecret. Expeted: clientid=${functions.config().oauth.clientid}, clientsecret=${functions.config().oauth.clientsecret} but got clientid=${clientId}, clientSecret=${clientSecret}}`);
      res.status(400).json({ error: "invalid_grant" });
    } else if (grantType === "authorization_code") {
      const code = req.body.code;
      try {
        const responseData = await getRefreshToken(code);
        res.json(responseData);
      } catch (error) {
        console.error(error);
        res.status(400).json({ error: "invalid_grant" });
      }
    } else if (grantType === "refresh_token") {
      const refreshToken = req.body.refresh_token;
      try {
        const responseData = await getAccessToken(refreshToken)
        res.json(responseData);
      } catch (error) {
        console.error(error);
        res.status(400).json({ error: "invalid_grant" });
      }
    } else {
      res.status(400).json({ error: "invalid_grant" });
    }
  })
  .post("/customtoken", async (req, res) => {
    try {
      res.json(await getCustomToken(req.body.idToken));
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'invalid_grant' })
    }
  })
  .get("/aouthlogin", (req, res) => {
    if (!isClientIdValid(req.query["client_id"])) {
      res.status(400).send('client id is invalid');
    } else if (!isRedirectUriValid(req.query["redirect_uri"])) {
      res.status(400).send('redirect_uri is invalid');
    } else {
      res.sendFile(pathJoin(__dirname + '/login.html'));
    }
  });

function getUserId(token: string | null) {
  if (!token) {
    return null;
  }
  return auth
    .verifyIdToken(token)
    .then(r => r.uid)
    .catch(e => null);
}

function getToken(headers: IncomingHttpHeaders): string | null {
  if (headers && headers.authorization) {
    return headers.authorization.split(" ")[1];
  }
  return null;
}

export const fn = functions.https.onRequest(app);
export const onCreateUser = functions.auth.user().onCreate(onUserCreate)
