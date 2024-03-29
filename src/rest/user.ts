import { KeyValue } from "../interfaces/general";
import {
  keyCloakListUsers,
  keyCloakGetUser,
  keyCloakUpdateUser,
  keyCloakDeleteUser,
  keyCloakGetUserGroups,
  keyCloakUpdatePasswordOfUser,
  keyCloakSendEmailVerificationToUser,
  keyCloakRemoveUserFromGroup,
  keyCloakGetUserByEmail,
  keyCloakLoginUser,
  keyCloakGetUserSessions
} from "../helpers/keycloak";
import { can } from "../helpers/authorization";
import {
  UserScopes,
  AdminScopes,
  Templates,
  ErrorCode,
  Tokens
} from "../interfaces/enum";
import { mail } from "../helpers/mail";
import { passwordResetToken, verifyToken } from "../helpers/jwt";
import { TokenUser } from "../interfaces/tables/user";

export const listUsersForUser = async (tokenUser: TokenUser) => {
  await can(tokenUser, AdminScopes.READ_ALL_USERS, "admin");
  return await keyCloakListUsers();
};

export const getUserForUser = async (tokenUser: TokenUser, id: string) => {
  await can(tokenUser, UserScopes.READ_USER, "user", id);
  return await keyCloakGetUser(id);
};

export const updateUserForUser = async (
  tokenUser: TokenUser,
  id: string,
  data: KeyValue
) => {
  await can(tokenUser, UserScopes.UPDATE_USER, "user", id);
  await keyCloakUpdateUser(id, data);
  return { updated: true, message: "user-updated" };
};

export const deleteUserForUser = async (tokenUser: TokenUser, id: string) => {
  await can(tokenUser, UserScopes.DELETE_USER, "user", id);
  await keyCloakDeleteUser(id);
  return { deleted: true, message: "user-deleted" };
};

export const updatePasswordOfUserForUser = async (
  tokenUser: TokenUser,
  id: string,
  currentPassword: string,
  newPassword: string
) => {
  await can(tokenUser, UserScopes.UPDATE_USER, "user", id);
  try {
    await keyCloakLoginUser(tokenUser.preferred_username, currentPassword);
  } catch (error) {
    throw new Error(ErrorCode.INCORRECT_PASSWORD);
  }
  await keyCloakUpdatePasswordOfUser(id, newPassword);
  return { updated: true, message: "password-updated" };
};

export const sendEmailVerificationToUserForUser = async (
  tokenUser: TokenUser,
  id: string
) => {
  await can(tokenUser, UserScopes.RESEND_USER_EMAIL_VERIFICATION, "user", id);
  await keyCloakSendEmailVerificationToUser(id);
  return { sent: true, message: "email-sent" };
};

export const getUserGroupsForUser = async (
  tokenUser: TokenUser,
  id: string
) => {
  await can(tokenUser, UserScopes.READ_USER_MEMBERSHIPS, "user", id);
  return await keyCloakGetUserGroups(id);
};

export const removeUserFromGroupForUser = async (
  tokenUser: TokenUser,
  id: string,
  groupId: string
) => {
  await can(tokenUser, UserScopes.DELETE_USER_MEMBERSHIPS, "user", id);
  return await keyCloakRemoveUserFromGroup(id, groupId);
};

export const resetPasswordForUser = async (email: string) => {
  const user = await keyCloakGetUserByEmail(email);
  if (!user || !user.id) throw new Error(ErrorCode.USER_NOT_FOUND);
  await mail(email, Templates.PASSWORD_RESET, {
    ...user,
    token: await passwordResetToken(user.id)
  });
};

export const changePasswordForUser = async (
  token: string,
  password: string
) => {
  const user = await verifyToken(token, Tokens.PASSWORD_RESET);
  await keyCloakUpdatePasswordOfUser(user.id, password);
};

export const getUserSessionsForUser = async (
  tokenUser: TokenUser,
  id: string
) => {
  await can(tokenUser, UserScopes.READ_USER_SESSION, "user", id);
  try {
    return await keyCloakGetUserSessions(id);
  } catch (error) {
    console.log("GOT", error, "GET ANAND");
    return { error: true };
  }
};
