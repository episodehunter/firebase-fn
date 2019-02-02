import { UserRecord } from "firebase-functions/lib/providers/auth";
import { firestore } from "./firebase-app";

export function onUserCreate(user: UserRecord) {
  return firestore
    .collection("users")
    .doc(user.uid)
    .set({
      following: []
    });
}