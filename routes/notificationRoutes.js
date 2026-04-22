const express = require("express");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

// Lấy tất cả thông báo của user
router.get("/user/:userId", notificationController.getNotifications);

// Lấy thông báo chưa đọc
router.get("/user/:userId/unread", notificationController.getUnreadNotifications);

// Đếm thông báo chưa đọc
router.get("/user/:userId/unread/count", notificationController.countUnread);

// Tạo thông báo mới
router.post("/user/:userId", notificationController.createNotification);

// Tạo thông báo nhắc việc tự động
router.post("/user/:userId/reminders", notificationController.generateReminders);

// Đánh dấu tất cả đã đọc
router.patch("/user/:userId/read-all", notificationController.markAllAsRead);

// Đánh dấu đã đọc một thông báo
router.patch("/:id/user/:userId/read", notificationController.markAsRead);

// Xóa thông báo
router.delete("/:id/user/:userId", notificationController.deleteNotification);

module.exports = router;
