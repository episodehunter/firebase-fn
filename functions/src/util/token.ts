import { auth } from "./firebase-app";
import { IncomingHttpHeaders } from "http";

export function getUserId(token: string | null): Promise<string | null> {
  if (!token) {
    return Promise.resolve(null);
  }
  return auth
    .verifyIdToken(token)
    .then(r => r.uid || r.user_id || r.sub || null)
    .catch(e => null);
}

export function getToken(headers: IncomingHttpHeaders): string | null {
  if (headers && headers.authorization) {
    return headers.authorization.split(" ")[1];
  }
  return null;
}