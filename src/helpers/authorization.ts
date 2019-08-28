import {
  ErrorCode,
  AdminScopes,
  UserScopes,
  OrgScopes
} from "../interfaces/enum";

export const can = async (
  user: any,
  action: AdminScopes | UserScopes | OrgScopes,
  targetType: "user" | "admin" | "group",
  targetId?: string
) => {
  // You can do anything to yourself
  if (targetType === "user" && user && user.id === targetId) return true;

  return true;

  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};
