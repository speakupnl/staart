import {
  KEYCLOAK_BASE_URL,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REALM
} from "../config";
import KcAdminClient from "keycloak-admin";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";
import { KeyValue } from "../interfaces/general";
import GroupRepresentation from "keycloak-admin/lib/defs/groupRepresentation";
import jwt from "jsonwebtoken";

interface JWT {
  jti: string;
  iat: number;
  exp: number;
}

const speakHub = new KcAdminClient({
  baseUrl: KEYCLOAK_BASE_URL,
  realmName: "master"
});

export const keyCloakAuthenticate = async () => {
  const token = speakHub.getAccessToken();
  if (token) {
    const decoded = jwt.decode(token) as JWT;
    if (decoded.exp && decoded.exp * 1000 > new Date().getTime()) return;
  }
  await speakHub.auth({
    username: process.env.EXAMPLE_USERNAME as string,
    password: process.env.EXAMPLE_PASSWORD as string,
    grantType: "password",
    clientId: KEYCLOAK_CLIENT_ID
  });
};

export const keyCloakCreateUser = async (user: UserRepresentation) => {
  await keyCloakAuthenticate();
  user.username = user.username || user.email;
  const result = await speakHub.users.create({
    ...user,
    realm: KEYCLOAK_REALM
  });
  await keyCloakSendEmailVerificationToUser(result.id);
  return result;
};

export const keyCloakListUsers = async () => {
  await keyCloakAuthenticate();
  return await speakHub.users.find({
    realm: KEYCLOAK_REALM
  });
};

export const keyCloakGetUser = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.users.findOne({
    id,
    realm: KEYCLOAK_REALM
  });
};

export const keyCloakUpdateUser = async (id: string, data: KeyValue) => {
  await keyCloakAuthenticate();
  return await speakHub.users.update({ id, realm: KEYCLOAK_REALM }, data);
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
    },
    realm: KEYCLOAK_REALM
  });
};

export const keyCloakSendEmailVerificationToUser = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.users.sendVerifyEmail({ id, realm: KEYCLOAK_REALM });
};

export const keyCloakDeleteUser = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.users.del({ id, realm: KEYCLOAK_REALM });
};

export const keyCloakGetUserGroups = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.users.listGroups({ id, realm: KEYCLOAK_REALM });
};

export const keyCloakAddUserToGroup = async (id: string, groupId: string) => {
  await keyCloakAuthenticate();
  return await speakHub.users.addToGroup({
    id,
    groupId,
    realm: KEYCLOAK_REALM
  });
};

export const keyCloakRemoveUserFromGroup = async (
  id: string,
  groupId: string
) => {
  await keyCloakAuthenticate();
  return await speakHub.users.delFromGroup({
    id,
    groupId,
    realm: KEYCLOAK_REALM
  });
};

export const keyCloakListGroups = async () => {
  await keyCloakAuthenticate();
  return await speakHub.groups.find({ realm: KEYCLOAK_REALM });
};

export const keyCloakCreateGroup = async (group: GroupRepresentation) => {
  await keyCloakAuthenticate();
  return await speakHub.groups.create({ ...group, realm: KEYCLOAK_REALM });
};

export const keyCloakGetGroup = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.groups.findOne({ id, realm: KEYCLOAK_REALM });
};

export const keyCloakGetGroupMembers = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.groups.listMembers({ id, realm: KEYCLOAK_REALM });
};

export const keyCloakUpdateGroup = async (id: string, data: KeyValue) => {
  await keyCloakAuthenticate();
  return await speakHub.groups.update({ id, realm: KEYCLOAK_REALM }, data);
};

export const keyCloakDeleteGroup = async (id: string) => {
  await keyCloakAuthenticate();
  return await speakHub.groups.del({ id, realm: KEYCLOAK_REALM });
};
