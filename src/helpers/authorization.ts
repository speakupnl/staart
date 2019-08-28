import { ErrorCode } from "../interfaces/enum";

export const can = async (
  user: any,
  action: any,
  targetType: "user" | "admin" | "group",
  targetId?: string
) => {
  // You can do anything to yourself
  if (targetType === "user" && user.id === targetId) return true;

  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};
