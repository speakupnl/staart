import { KeyValue } from "../interfaces/general";
import {
  keyCloakListGroups,
  keyCloakGetGroup,
  keyCloakUpdateGroup,
  keyCloakDeleteGroup,
  keyCloakCreateGroup,
  keyCloakAddUserToGroup,
  keyCloakRemoveUserFromGroup,
  keyCloakGetGroupMembers,
  keyCloakGetUserByEmail,
  keyCloakCreateUser
} from "../helpers/keycloak";
import { can } from "../helpers/authorization";
import { OrgScopes, AdminScopes } from "../interfaces/enum";
import { TokenUser } from "../interfaces/tables/user";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";

export const listGroupsForUser = async (tokenUser: TokenUser) => {
  await can(tokenUser, AdminScopes.READ_ALL_USERS, "admin");
  return await keyCloakListGroups();
};

export const createGroupForUser = async (
  tokenUser: TokenUser,
  data: KeyValue
) => {
  await can(tokenUser, OrgScopes.CREATE_ORG, "group");
  const result = await keyCloakCreateGroup(data);
  await keyCloakAddUserToGroup(tokenUser.id, result.id);
  return result;
};

export const getGroupForUser = async (tokenUser: TokenUser, id: string) => {
  await can(tokenUser, OrgScopes.READ_ORG, "group", id);
  return await keyCloakGetGroup(id);
};

export const getGroupMembersForUser = async (
  tokenUser: TokenUser,
  id: string
) => {
  await can(tokenUser, OrgScopes.READ_ORG, "group", id);
  return await keyCloakGetGroupMembers(id);
};

export const updateGroupForUser = async (
  tokenUser: TokenUser,
  id: string,
  data: KeyValue
) => {
  await can(tokenUser, OrgScopes.UPDATE_ORG, "group", id);
  await keyCloakUpdateGroup(id, data);
  return { updated: true, message: "user-updated" };
};

export const deleteGroupForUser = async (tokenUser: TokenUser, id: string) => {
  await can(tokenUser, OrgScopes.DELETE_ORG, "group", id);
  await keyCloakDeleteGroup(id);
  return { deleted: true, message: "user-deleted" };
};

export const addUserToGroupForUser = async (
  tokenUser: TokenUser,
  id: string,
  userId: string
) => {
  await can(tokenUser, OrgScopes.CREATE_ORG_MEMBERSHIPS, "group", id);
  return await keyCloakAddUserToGroup(userId, id);
};

export const addUserToGroupByNameEmailForUser = async (
  tokenUser: TokenUser,
  id: string,
  email: string,
  firstName: string,
  lastName: string
) => {
  await can(tokenUser, OrgScopes.CREATE_ORG_MEMBERSHIPS, "group", id);
  let user: UserRepresentation | null = null;
  try {
    user = await keyCloakGetUserByEmail(email);
  } catch (error) {}
  if (user && user.id) {
    return await keyCloakAddUserToGroup(user.id, id);
  } else {
    // create new user
    const newUser = await keyCloakCreateUser({
      email,
      firstName,
      lastName
    });
    return await keyCloakAddUserToGroup(newUser.id, id);
  }
};

export const removeUserFromGroupForUser = async (
  tokenUser: TokenUser,
  id: string,
  userId: string
) => {
  await can(tokenUser, OrgScopes.CREATE_ORG_MEMBERSHIPS, "group", id);
  return await keyCloakRemoveUserFromGroup(userId, id);
};
