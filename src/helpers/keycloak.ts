import {
  KEYCLOAK_BASE_URL,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REALM
} from "../config";
import { Issuer } from "openid-client";
import KcAdminClient from "keycloak-admin";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";

const speakHub = new KcAdminClient({
  baseUrl: KEYCLOAK_BASE_URL
});
speakHub.auth({
  username: process.env.EXAMPLE_USERNAME as string,
  password: process.env.EXAMPLE_PASSWORD as string,
  grantType: "password",
  clientId: KEYCLOAK_CLIENT_ID
});

export const createKeyCloakUser = async (user: UserRepresentation) => {
  try {
    return await speakHub.users.create({
      realm: KEYCLOAK_REALM,
      ...user
    });
  } catch (error) {
    console.log("Error got", error);
  }
};

export const keyCloakListUsers = async () => {
  return await speakHub.users.find({
    realm: KEYCLOAK_REALM
  });
};

setInterval(async () => {
  console.log("Refreshing token...");
  const keycloakIssuer = await Issuer.discover(
    `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}`
  );
  const client = new keycloakIssuer.Client({
    client_id: KEYCLOAK_CLIENT_ID
  });
  let tokenSet = await client.grant({
    grant_type: "password",
    username: process.env.EXAMPLE_USERNAME as string,
    password: process.env.EXAMPLE_PASSWORD as string,
    clientId: KEYCLOAK_CLIENT_ID
  });
  const refreshToken = tokenSet.refresh_token;
  tokenSet = await client.refresh(refreshToken);
  speakHub.setAccessToken(tokenSet.access_token);
}, 58000);
