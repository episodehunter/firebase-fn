import * as express from "express";
import * as cors from "cors";
import * as functions from "firebase-functions";
import { get } from "./history";
import { updateTitles, getTitles } from './titles';
import { auth } from "./firebase-app";
import { IncomingHttpHeaders } from "http";

const app = express();

app.use(cors({ origin: true }));

app.get("/ping", (req, res) => res.send("Pong"));
app.get("/history", async (req, res) => {
  const uid = await getUserId(getToken(req.headers));
  if (!uid) {
    res.sendStatus(403);
  } else {
    try {
      res.send(await get(uid, Math.min(req.query.page | 0, 0)));
    } catch (error) {
      console.error(error)
      res.sendStatus(500);
    }
  }
});
app.get("/updatetitles", async (req, res) => {
  try {
    res.send(await updateTitles());
  } catch (error) {
    console.error(error)
    res.sendStatus(500);
  }
});

app.get("/titles", async (req, res) => {
  try {
    res.send(await getTitles());
  } catch (error) {
    console.error(error)
    res.sendStatus(500);
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
