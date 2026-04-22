const notificationModel = require("../models/notificationModel");
const taskModel = require("../models/taskModel");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Lấy tất cả thông báo của user
 */
async function getNotificationsByUserId(userId) {
  return await notificationModel.getNotificationsByUserId(userId);
}

/**
 * Lấy thông báo chưa đọc
 */
async function getUnreadNotifications(userId) {
  return await notificationModel.getUnreadNotifications(userId);
}

/**
 * Đếm thông báo chưa đọc
 */
async function countUnreadNotifications(userId) {
  return await notificationModel.countUnreadNotifications(userId);
}

/**
 * Tạo thông báo mới
 */
async function createNotification({ user_id, task_id, message }) {
  if (!message || !message.trim()) {
    throw createError("Nội dung thông báo không được để trống.", 400);
  }

  return await notificationModel.createNotification({
    user_id,
    task_id: task_id || null,
    message: message.trim(),
  });
}

/**
 * Đánh dấu đã đọc một thông báo
 */
async function markAsRead(id, userId) {
  const notification = await notificationModel.getNotificationById(id);
  if (!notification) {
    throw createError("Không tìm thấy thông báo.", 404);
  }

  if (notification.user_id !== userId) {
    throw createError("Bạn không có quyền thao tác thông báo này.", 403);
  }

  return await notificationModel.markAsRead(id);
}

/**
 * Đánh dấu tất cả là đã đọc
 */
async function markAllAsRead(userId) {
  return await notificationModel.markAllAsRead(userId);
}

/**
 * Xóa thông báo
 */
async function deleteNotification(id, userId) {
  const notification = await notificationModel.getNotificationById(id);
  if (!notification) {
    throw createError("Không tìm thấy thông báo để xóa.", 404);
  }

  if (notification.user_id !== userId) {
    throw createError("Bạn không có quyền xóa thông báo này.", 403);
  }

  await notificationModel.deleteNotification(id);
  return notification;
}

/**
 * Tạo thông báo nhắc việc cho tasks sắp hạn / quá hạn
 */
async function generateTaskReminders(userId) {
  const tasks = await taskModel.getOverdueAndUpcomingTasks(userId);
  const notifications = [];

  for (const task of tasks) {
    const now = new Date();
    const dueDate = new Date(task.due_date);
    let message;

    if (dueDate < now) {
      message = `Công việc "${task.title}" đã quá hạn!`;
    } else {
      message = `Công việc "${task.title}" sắp đến hạn (${dueDate.toLocaleDateString("vi-VN")}).`;
    }

    const notification = await notificationModel.createNotification({
      user_id: userId,
      task_id: task.task_id,
      message,
    });
    notifications.push(notification);
  }

  return notifications;
}

module.exports = {
  getNotificationsByUserId,
  getUnreadNotifications,
  countUnreadNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  generateTaskReminders,
};
