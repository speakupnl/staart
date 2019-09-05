import {
  ErrorCode,
  AdminScopes,
  UserScopes,
  OrgScopes
} from "../interfaces/enum";
import { TokenUser } from "../interfaces/tables/user";
import { keyCloakGetUserGroups } from "./keycloak";

export const can = async (
  user: TokenUser,
  action: AdminScopes | UserScopes | OrgScopes,
  targetType: "user" | "admin" | "group",
  targetId?: string
) => {
  if (!user) throw new Error(ErrorCode.INVALID_TOKEN);

  if (targetType === "user" && user.id === targetId) return true;

  if (targetType === "group" && action == OrgScopes.CREATE_ORG) return true;

  if (targetType === "group") {
    // Check if you're a member of this group
    let isMember = false;
    const memberships = await keyCloakGetUserGroups(user.id);
    memberships.data.forEach(group => {
      if (group.id === targetId) isMember = true;
    });
    if (isMember) return true;
  }

  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};
