import {
  KEYCLOAK_BASE_URL,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REALM
} from "../config";
import KcAdminClient from "keycloak-admin";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";
import { KeyValue } from "../interfaces/general";
import GroupRepresentation from "keycloak-admin/lib/defs/groupRepresentation";

const speakHub = new KcAdminClient({
  baseUrl: KEYCLOAK_BASE_URL,
  realmName: KEYCLOAK_REALM
});

export const keyCloakAuthenticate = async () => {
  await speakHub.auth({
    username: process.env.EXAMPLE_USERNAME as string,
    password: process.env.EXAMPLE_PASSWORD as string,
    grantType: "password",
    clientId: KEYCLOAK_CLIENT_ID
  });
  // await speakHub.setConfig({
  //   realmName: KEYCLOAK_REALM
  // });
  // console.log("Very good", speakHub.getAccessToken());
};

export const createKeyCloakUser = async (user: UserRepresentation) => {
  await keyCloakAuthenticate();
  user.username = user.username || user.email;
  const result = await speakHub.users.create({
    ...user
  });
  await keyCloakSendEmailVerificationToUser(result.id);
  return result;
};

export const keyCloakListUsers = async () => {
  await keyCloakAuthenticate();
  try {
    return await speakHub.users.find();
  } catch (error) {
    console.log("Got error", error);
    return [];
  }
};

export const keyCloakGetUser = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.users.findOne({
    id
  });
};

export const keyCloakUpdateUser = async (id: string, data: KeyValue) => {
  await keyCloakAuthenticate();
  return await speakHub.users.update({ id }, data);
};

export const keyCloakUpdatePasswordOfUser = async (
  id: string,
  newPassword: string
) => {
  await keyCloakAuthenticate();
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
  await keyCloakAuthenticate();
  return await speakHub.users.sendVerifyEmail({ id });
};

export const keyCloakDeleteUser = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.users.del({ id });
};

export const keyCloakGetUserGroups = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.users.listGroups({ id });
};

export const keyCloakAddUserToGroup = async (id: string, groupId: string) => {
  await keyCloakAuthenticate();
  return await speakHub.users.addToGroup({ id, groupId });
};

export const keyCloakRemoveUserFromGroup = async (
  id: string,
  groupId: string
) => {
  await keyCloakAuthenticate();
  return await speakHub.users.delFromGroup({ id, groupId });
};

export const keyCloakListGroups = async () => {
  await keyCloakAuthenticate();
  return await speakHub.groups.find();
};

export const keyCloakCreateGroup = async (group: GroupRepresentation) => {
  await keyCloakAuthenticate();
  return await speakHub.groups.create(group);
};

export const keyCloakGetGroup = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.groups.findOne({ id });
};

export const keyCloakGetGroupMembers = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.groups.listMembers({ id });
};

export const keyCloakUpdateGroup = async (id: string, data: KeyValue) => {
  await keyCloakAuthenticate();
  return await speakHub.groups.update({ id }, data);
};

export const keyCloakDeleteGroup = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.groups.del({ id });
};
