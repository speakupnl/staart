import { KeyValue } from "../interfaces/general";
import {
  keyCloakListUsers,
  keyCloakGetUser,
  keyCloakUpdateUser,
  keyCloakDeleteUser,
  keyCloakGetUserGroups,
  keyCloakUpdatePasswordOfUser,
  keyCloakSendEmailVerificationToUser,
  keyCloakRemoveUserFromGroup
} from "../helpers/keycloak";
import { can } from "../helpers/authorization";
import { UserScopes, AdminScopes } from "../interfaces/enum";

export const listUsersForUser = async (tokenUser: any) => {
  await can(tokenUser, AdminScopes.READ_ALL_USERS, "admin");
  return await keyCloakListUsers();
};

export const getUserForUser = async (tokenUser: any, id: string) => {
  await can(tokenUser, UserScopes.READ_USER, "user", id);
  return await keyCloakGetUser(id);
};

export const updateUserForUser = async (
  tokenUser: any,
  id: string,
  data: KeyValue
) => {
  await can(tokenUser, UserScopes.UPDATE_USER, "user", id);
  await keyCloakUpdateUser(id, data);
  return { updated: true, message: "user-updated" };
};

export const deleteUserForUser = async (tokenUser: any, id: string) => {
  await can(tokenUser, UserScopes.DELETE_USER, "user", id);
  await keyCloakDeleteUser(id);
  return { deleted: true, message: "user-deleted" };
};

export const updatePasswordOfUserForUser = async (
  tokenUser: any,
  id: string,
  password: string
) => {
  await can(tokenUser, UserScopes.UPDATE_USER, "user", id);
  await keyCloakUpdatePasswordOfUser(id, password);
  return { updated: true, message: "password-updated" };
};

export const sendEmailVerificationToUserForUser = async (
  tokenUser: any,
  id: string
) => {
  await can(tokenUser, UserScopes.RESEND_USER_EMAIL_VERIFICATION, "user", id);
  await keyCloakSendEmailVerificationToUser(id);
  return { sent: true, message: "email-sent" };
};

export const getUserGroupsForUser = async (tokenUser: any, id: string) => {
  await can(tokenUser, UserScopes.READ_USER_MEMBERSHIPS, "user", id);
  return await keyCloakGetUserGroups(id);
};

export const removeUserFromGroupForUser = async (
  tokenUser: any,
  id: string,
  groupId: string
) => {
  await can(tokenUser, UserScopes.DELETE_USER_MEMBERSHIPS, "user", id);
  return await keyCloakRemoveUserFromGroup(id, groupId);
};
