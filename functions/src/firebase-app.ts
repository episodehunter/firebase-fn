import * as admin from "firebase-admin";

const app = admin.initializeApp();

const firestore = app.firestore();
firestore.settings({ timestampsInSnapshots: true });

const auth = app.auth();

export { firestore, auth };
