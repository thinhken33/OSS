const db = require("../config/db");

/**
 * Lấy tất cả thông báo của user
 */
async function getNotificationsByUserId(userId) {
  const result = await db.query(
    `SELECT n.*, t.title AS task_title
     FROM Notifications n
     LEFT JOIN Tasks t ON n.task_id = t.task_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Lấy thông báo chưa đọc của user
 */
async function getUnreadNotifications(userId) {
  const result = await db.query(
    `SELECT n.*, t.title AS task_title
     FROM Notifications n
     LEFT JOIN Tasks t ON n.task_id = t.task_id
     WHERE n.user_id = $1 AND n.is_read = FALSE
     ORDER BY n.created_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Đếm số thông báo chưa đọc
 */
async function countUnreadNotifications(userId) {
  const result = await db.query(
    `SELECT COUNT(*) AS count FROM Notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return parseInt(result.rows[0].count);
}

/**
 * Lấy thông báo theo ID
 */
async function getNotificationById(id) {
  const result = await db.query(
    `SELECT * FROM Notifications WHERE notification_id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Tạo thông báo mới
 */
async function createNotification({ user_id, task_id, message }) {
  const result = await db.query(
    `INSERT INTO Notifications (user_id, task_id, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, task_id || null, message]
  );
  return result.rows[0];
}

/**
 * Đánh dấu đã đọc một thông báo
 */
async function markAsRead(id) {
  const result = await db.query(
    `UPDATE Notifications SET is_read = TRUE WHERE notification_id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Đánh dấu tất cả thông báo của user là đã đọc
 */
async function markAllAsRead(userId) {
  const result = await db.query(
    `UPDATE Notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE RETURNING *`,
    [userId]
  );
  return result.rows;
}

/**
 * Xóa thông báo
 */
async function deleteNotification(id) {
  const result = await db.query(
    `DELETE FROM Notifications WHERE notification_id = $1 RETURNING notification_id`,
    [id]
  );
  return result.rowCount > 0;
}

module.exports = {
  getNotificationsByUserId,
  getUnreadNotifications,
  countUnreadNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
