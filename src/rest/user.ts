import { ErrorCode, EventType, Authorizations } from "../interfaces/enum";
import {
  getUser,
  updateUser,
  getUserApprovedLocations,
  deleteUser,
  deleteAllUserApprovedLocations,
  createBackupCodes,
  deleteUserBackupCodes,
  getUserBackupCodes
} from "../crud/user";
import {
  deleteAllUserMemberships,
  getUserMembershipsDetailed,
  addOrganizationToMemberships
} from "../crud/membership";
import { User } from "../interfaces/tables/user";
import { Locals, KeyValue } from "../interfaces/general";
import { createEvent, getUserEvents, deleteAllUserEvents } from "../crud/event";
import { getUserEmails, deleteAllUserEmails } from "../crud/email";
import { can } from "../helpers/authorization";
import { getUserNotifications, updateNotification } from "../crud/notification";
import { authenticator } from "otplib";
import { toDataURL } from "qrcode";
import { SERVICE_2FA } from "../config";
import { compare } from "bcryptjs";
import { getPaginatedData } from "../crud/data";
import { addLocationToEvents } from "../helpers/location";

export const getUserFromId = async (userId: number, tokenUserId: number) => {
  if (await can(tokenUserId, Authorizations.READ, "user", userId))
    return getUser(userId);
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const updateUserForUser = async (
  tokenUserId: number,
  updateUserId: number,
  data: User,
  locals: Locals
) => {
  delete data.password;
  if (await can(tokenUserId, Authorizations.UPDATE, "user", updateUserId)) {
    await updateUser(updateUserId, data);
    await createEvent(
      {
        userId: tokenUserId,
        type: EventType.USER_UPDATED,
        data: { id: updateUserId, data }
      },
      locals
    );
    return;
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const updatePasswordForUser = async (
  tokenUserId: number,
  updateUserId: number,
  oldPassword: string,
  newPassword: string,
  locals: Locals
) => {
  if (
    await can(tokenUserId, Authorizations.UPDATE_SECURE, "user", updateUserId)
  ) {
    const user = await getUser(updateUserId, true);
    if (!user.password) throw new Error(ErrorCode.MISSING_PASSWORD);
    const correctPassword = await compare(oldPassword, user.password);
    if (!correctPassword) throw new Error(ErrorCode.INCORRECT_PASSWORD);
    await updateUser(updateUserId, { password: newPassword });
    await createEvent(
      {
        userId: tokenUserId,
        type: EventType.AUTH_PASSWORD_CHANGED,
        data: { id: updateUserId }
      },
      locals
    );
    return;
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const deleteUserForUser = async (
  tokenUserId: number,
  updateUserId: number,
  locals: Locals
) => {
  if (await can(tokenUserId, Authorizations.DELETE, "user", updateUserId)) {
    await deleteAllUserEmails(updateUserId);
    await deleteAllUserMemberships(updateUserId);
    await deleteAllUserApprovedLocations(updateUserId);
    await deleteAllUserEvents(updateUserId);
    await deleteUser(updateUserId);
    await createEvent(
      {
        userId: tokenUserId,
        type: EventType.USER_DELETED,
        data: { id: updateUserId }
      },
      locals
    );
    return;
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getRecentEventsForUser = async (
  tokenUserId: number,
  dataUserId: number,
  query: KeyValue
) => {
  if (await can(tokenUserId, Authorizations.READ_SECURE, "user", dataUserId)) {
    const events = await getPaginatedData({
      table: "events",
      conditions: { userId: dataUserId },
      ...query
    });
    events.data = await addLocationToEvents(events.data);
    return events;
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getMembershipsForUser = async (
  tokenUserId: number,
  dataUserId: number,
  query: KeyValue
) => {
  if (await can(tokenUserId, Authorizations.READ, "user", dataUserId)) {
    const memberships = await getPaginatedData({
      table: "memberships",
      conditions: { userId: dataUserId },
      ...query
    });
    memberships.data = await addOrganizationToMemberships(memberships.data);
    return memberships;
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getAllDataForUser = async (
  tokenUserId: number,
  userId: number
) => {
  if (!(await can(tokenUserId, Authorizations.READ_SECURE, "user", userId)))
    throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
  const user = await getUser(userId);
  const memberships = await getUserMembershipsDetailed(userId);
  const emails = await getUserEmails(userId);
  const events = await getUserEvents(userId);
  const approvedLocations = await getUserApprovedLocations(userId);
  return { user, memberships, emails, events, approvedLocations };
};

export const getNotificationsForUser = async (
  tokenUserId: number,
  dataUserId: number
) => {
  if (await can(tokenUserId, Authorizations.READ, "user", dataUserId))
    return await getUserNotifications(dataUserId);
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const updateNotificationForUser = async (
  tokenUserId: number,
  dataUserId: number,
  notificationId: number,
  data: KeyValue
) => {
  if (await can(tokenUserId, Authorizations.UPDATE, "user", dataUserId))
    return await updateNotification(notificationId, data);
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const enable2FAForUser = async (tokenUserId: number, userId: number) => {
  if (!(await can(tokenUserId, Authorizations.UPDATE_SECURE, "user", userId)))
    throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
  const secret = authenticator.generateSecret();
  await updateUser(userId, { twoFactorSecret: secret });
  const authPath = authenticator.keyuri(`user-${userId}`, SERVICE_2FA, secret);
  const qrCode = await toDataURL(authPath);
  return { qrCode };
};

export const verify2FAForUser = async (
  tokenUserId: number,
  userId: number,
  verificationCode: number
) => {
  if (!(await can(tokenUserId, Authorizations.UPDATE_SECURE, "user", userId)))
    throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
  const secret = (await getUser(userId, true)).twoFactorSecret as string;
  if (!secret) throw new Error(ErrorCode.NOT_ENABLED_2FA);
  if (!authenticator.check(verificationCode.toString(), secret))
    throw new Error(ErrorCode.INVALID_2FA_TOKEN);
  await createBackupCodes(userId, 10);
  await updateUser(userId, { twoFactorEnabled: true });
};

export const disable2FAForUser = async (
  tokenUserId: number,
  userId: number
) => {
  if (!(await can(tokenUserId, Authorizations.UPDATE_SECURE, "user", userId)))
    throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
  await deleteUserBackupCodes(userId);
  await updateUser(userId, { twoFactorEnabled: false, twoFactorSecret: "" });
};

export const getBackupCodesForUser = async (
  tokenUserId: number,
  userId: number
) => {
  if (!(await can(tokenUserId, Authorizations.READ_SECURE, "user", userId)))
    throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
  return await getUserBackupCodes(userId);
};

export const regenerateBackupCodesForUser = async (
  tokenUserId: number,
  userId: number
) => {
  if (!(await can(tokenUserId, Authorizations.READ_SECURE, "user", userId)))
    throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
  await deleteUserBackupCodes(userId);
  await createBackupCodes(userId, 10);
  return await getUserBackupCodes(userId);
};
