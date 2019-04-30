import { UserRecord } from "firebase-functions/lib/providers/auth";
import { firestore } from "./util/firebase-app";

export function onUserCreate(user: UserRecord) {
  return firestore
    .collection("users")
    .doc(user.uid)
    .set({
      following: [],
      apikey: generateApiKey()
    });
}

function generateApiKey() {
  const validChars = 'ABCDEFGHKMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz23456789';
  return Array.from<string>({ length: 5 }).reduce(key => {
    key += validChars[(Math.floor(Math.random() * Math.floor(validChars.length)))]
    return key;
  }, '')
}