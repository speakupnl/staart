import {
  ErrorCode,
  AdminScopes,
  UserScopes,
  OrgScopes
} from "../interfaces/enum";
import { TokenUser } from "../interfaces/tables/user";

export const can = async (
  user: TokenUser,
  action: AdminScopes | UserScopes | OrgScopes,
  targetType: "user" | "admin" | "group",
  targetId?: string
) => {
  if (!user) throw new Error(ErrorCode.INVALID_TOKEN);

  if (user.id === targetId) return true;

  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};
