import { auth } from "./firebase-app";

export function getUserId(token: string | null): Promise<string | null> {
  if (!token) {
    return Promise.resolve(null);
  }
  return auth
    .verifyIdToken(token)
    .then(r => r.uid || r.user_id || r.sub || null)
    .catch(e => null);
}
