import * as functions from "firebase-functions";
import { auth } from "./firebase-app";
import { fetch } from "./fetch";

function getApiKey() {
  return functions.config().root.apikey;
}

export function isClientIdAndSecretValid(clientId: string, clientSecret: string) {
  return isClientIdValid(clientId) && isSecretValid(clientSecret);
}

export function isClientIdValid(clientId: string) {
  return (clientId === functions.config().oauth.clientid);
}

function isSecretValid(clientSecret: string) {
  return (clientSecret === functions.config().oauth.clientsecret);
}

export function isRedirectUriValid(redirectUri: string) {
  return (redirectUri && redirectUri.startsWith('https://oauth-redirect.googleusercontent.com/r/'));
}


export async function getRefreshToken(code: string) {
  const response = await fetch(
    "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=" + getApiKey(),
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: code,
        returnSecureToken: true
      })
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  return {
    token_type: "Bearer",
    access_token: data.idToken,
    refresh_token: data.refreshToken,
    expires_in: data.expiresIn
  };
}

export async function getAccessToken(refreshToken: string) {
  const response = await fetch(
    "https://securetoken.googleapis.com/v1/token?key=" + getApiKey(),
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken
      })
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  return {
    token_type: "Bearer",
    access_token: data.id_token,
    expires_in: data.expires_in
  };
}

export async function getCustomToken(idToken: string) {
  const decodedToken = await auth.verifyIdToken(idToken);
  const customToken = await auth.createCustomToken(decodedToken.uid)
  return {
    token: customToken
  }
}
