import { UserRecord } from "firebase-functions/lib/providers/auth";
import { firestore } from "./util/firebase-app";
import { logger } from "./util/logger";

export function onUserCreate(user: UserRecord) {
  logger.log(`Create user ${user.uid}`)
  return firestore
    .collection("users")
    .doc(user.uid)
    .set({
      following: [],
      apikey: generateApiKey()
    });
}

export function onUserDelete(user: UserRecord) {
  logger.log(`Delete user ${user.uid}`)
  return firestore
    .collection("users")
    .doc(user.uid)
    .delete();
}

function generateApiKey() {
  const validChars = 'ABCDEFGHKMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz23456789';
  return Array.from<string>({ length: 5 }).reduce(key => {
    key += validChars[(Math.floor(Math.random() * Math.floor(validChars.length)))]
    return key;
  }, '')
}
