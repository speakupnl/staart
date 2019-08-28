import {
  KEYCLOAK_BASE_URL,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REALM
} from "../config";
import KcAdminClient from "keycloak-admin";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";

const speakHub = new KcAdminClient({
  baseUrl: KEYCLOAK_BASE_URL
});

export const createKeyCloakUser = async (user: UserRepresentation) => {
  await speakHub.users.create({
    realm: KEYCLOAK_REALM,
    ...user
  });
};

export const keyCloakListUsers = async () => {
  await speakHub.auth({
    username: process.env.EXAMPLE_USERNAME as string,
    password: process.env.EXAMPLE_PASSWORD as string,
    grantType: "password",
    clientId: KEYCLOAK_CLIENT_ID
  });
  return await speakHub.users.find({
    realm: KEYCLOAK_REALM
  });
};
