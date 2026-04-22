const notificationService = require("../services/notificationService");

/**
 * Lấy tất cả thông báo của user
 */
async function getNotifications(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const notifications = await notificationService.getNotificationsByUserId(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message || "Không lấy được thông báo." });
  }
}

/**
 * Lấy thông báo chưa đọc
 */
async function getUnreadNotifications(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const notifications = await notificationService.getUnreadNotifications(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Đếm thông báo chưa đọc
 */
async function countUnread(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const count = await notificationService.countUnreadNotifications(userId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Tạo thông báo mới
 */
async function createNotification(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const notification = await notificationService.createNotification({
      user_id: userId,
      task_id: req.body.task_id,
      message: req.body.message,
    });
    res.status(201).json({
      message: "Tạo thông báo thành công.",
      notification,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Đánh dấu đã đọc một thông báo
 */
async function markAsRead(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const notification = await notificationService.markAsRead(parseInt(req.params.id), userId);
    res.json({
      message: "Đã đánh dấu đã đọc.",
      notification,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Đánh dấu tất cả đã đọc
 */
async function markAllAsRead(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const notifications = await notificationService.markAllAsRead(userId);
    res.json({
      message: "Đã đánh dấu tất cả là đã đọc.",
      count: notifications.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Xóa thông báo
 */
async function deleteNotification(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const notification = await notificationService.deleteNotification(parseInt(req.params.id), userId);
    res.json({
      message: "Đã xóa thông báo.",
      notification,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Tạo thông báo nhắc việc tự động
 */
async function generateReminders(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const notifications = await notificationService.generateTaskReminders(userId);
    res.json({
      message: `Đã tạo ${notifications.length} thông báo nhắc việc.`,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getNotifications,
  getUnreadNotifications,
  countUnread,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  generateReminders,
};
