const express = require("express");
const taskController = require("../controllers/taskController");

const router = express.Router();

// Lấy tất cả tasks của user
router.get("/user/:userId", taskController.getTasks);

// Tìm kiếm & lọc tasks
router.get("/user/:userId/search", taskController.searchTasks);

// Lấy thống kê tasks
router.get("/user/:userId/stats", taskController.getTaskStats);

// Lấy task theo ID
router.get("/:id", taskController.getTaskById);

// Tạo task mới
router.post("/user/:userId", taskController.createTask);

// Cập nhật task
router.put("/:id/user/:userId", taskController.updateTask);

// Cập nhật trạng thái task
router.patch("/:id/user/:userId/status", taskController.updateTaskStatus);

// Xóa task
router.delete("/:id/user/:userId", taskController.deleteTask);

module.exports = router;