import { Notification } from "../interfaces/tables/user";
import {
  query,
  tableValues,
  removeReadOnlyValues,
  setValues
} from "../helpers/mysql";
import { ErrorCode } from "../interfaces/enum";
import { KeyValue } from "../interfaces/general";

/**
 * Create a notification
 */
export const createNotification = async (notification: Notification) => {
  notification.createdAt = new Date();
  notification.updatedAt = notification.createdAt;
  notification.read = !!notification.read;
  return await query(
    `INSERT INTO notifications ${tableValues(notification)}`,
    Object.values(notification)
  );
};

/**
 * View a notification
 */
export const getNotification = async (notificationId: number) => {
  return (<Notification[]>(
    await query("SELECT * FROM notifications WHERE id = ?", [notificationId])
  ))[0];
};

/**
 * Update a notification
 */
export const updateNotification = async (
  notificationId: number,
  data: KeyValue
) => {
  const notificationDetails = await getNotification(notificationId);
  if (!notificationDetails.userId) throw new Error(ErrorCode.NOT_FOUND);
  data.updatedAt = new Date();
  data = removeReadOnlyValues(data);
  return await query(
    `UPDATE notifications SET ${setValues(data)} WHERE id = ?`,
    [...Object.values(data), notificationId]
  );
};

/**
 * Delete an notification
 */
export const deleteNotification = async (notificationId: number) => {
  const notificationDetails = await getNotification(notificationId);
  return await query("DELETE FROM `notifications` WHERE id = ? LIMIT 1", [
    notificationId
  ]);
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId: number) => {
  return <Notification[]>(
    await query("SELECT * FROM notifications WHERE userId = ?", [userId])
  );
};
