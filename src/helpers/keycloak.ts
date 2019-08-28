import {
  KEYCLOAK_BASE_URL,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REALM
} from "../config";
import { Issuer } from "openid-client";
import KcAdminClient from "keycloak-admin";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";
import { KeyValue } from "../interfaces/general";
import GroupRepresentation from "keycloak-admin/lib/defs/groupRepresentation";

const speakHub = new KcAdminClient({
  baseUrl: KEYCLOAK_BASE_URL
});
speakHub.auth({
  username: process.env.EXAMPLE_USERNAME as string,
  password: process.env.EXAMPLE_PASSWORD as string,
  grantType: "password",
  clientId: KEYCLOAK_CLIENT_ID
});
speakHub.setConfig({
  realmName: KEYCLOAK_REALM
});

export const createKeyCloakUser = async (user: UserRepresentation) => {
  return await speakHub.users.create({
    ...user
  });
};

export const keyCloakListUsers = async () => {
  return await speakHub.users.find();
};

export const keyCloakGetUser = async (id: string) => {
  return await speakHub.users.findOne({
    id
  });
};

export const keyCloakUpdateUser = async (id: string, data: KeyValue) => {
  return await speakHub.users.update({ id }, data);
};

export const keyCloakUpdatePasswordOfUser = async (
  id: string,
  newPassword: string
) => {
  return await speakHub.users.resetPassword({
    id,
    credential: {
      temporary: false,
      type: "password",
      value: newPassword
    }
  });
};

export const keyCloakSendEmailVerificationToUser = async (id: string) => {
  return await speakHub.users.sendVerifyEmail({ id });
};

export const keyCloakDeleteUser = async (id: string) => {
  return await speakHub.users.del({ id });
};

export const keyCloakGetUserGroups = async (id: string) => {
  return await speakHub.users.listGroups({ id });
};

export const keyCloakAddUserToGroup = async (id: string, groupId: string) => {
  return await speakHub.users.addToGroup({ id, groupId });
};

export const keyCloakRemoveUserFromGroup = async (
  id: string,
  groupId: string
) => {
  return await speakHub.users.delFromGroup({ id, groupId });
};

export const keyCloakGetGroups = async () => {
  return await speakHub.groups.find();
};

export const keyCloakCreateGroup = async (group: GroupRepresentation) => {
  return await speakHub.groups.create(group);
};

export const keyCloakGetGroup = async (id: string) => {
  return await speakHub.groups.findOne({ id });
};

export const keyCloakUpdateGroup = async (id: string, data: KeyValue) => {
  return await speakHub.groups.update({ id }, data);
};

export const keyCloakDeleteGroup = async (id: string) => {
  return await speakHub.groups.del({ id });
};

setInterval(async () => {
  /**
   * For now, I log in every 58 seconds to update the token
   * As soon as my PR is merged and the `refresh` method is up,
   * we can remove this and uncomment the lines below
   *
   * https://github.com/DefinitelyTyped/DefinitelyTyped/pull/37971
   */
  speakHub.auth({
    username: process.env.EXAMPLE_USERNAME as string,
    password: process.env.EXAMPLE_PASSWORD as string,
    grantType: "password",
    clientId: KEYCLOAK_CLIENT_ID
  });
  // console.log("Refreshing token...");
  // const keycloakIssuer = await Issuer.discover(
  //   `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}`
  // );
  // const client = new keycloakIssuer.Client({
  //   client_id: KEYCLOAK_CLIENT_ID
  // });
  // let tokenSet = await client.grant({
  //   grant_type: "password",
  //   username: process.env.EXAMPLE_USERNAME as string,
  //   password: process.env.EXAMPLE_PASSWORD as string,
  //   clientId: KEYCLOAK_CLIENT_ID
  // });
  // const refreshToken = tokenSet.refresh_token;
  // tokenSet = await client.refresh(refreshToken);
  // speakHub.setAccessToken(tokenSet.access_token);
}, 58000);
