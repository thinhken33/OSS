const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// Đăng ký & Đăng nhập
router.post("/register", userController.register);
router.post("/login", userController.login);

// Lấy danh sách tất cả users (Admin)
router.get("/", userController.getAllUsers);

// Lấy thông tin user theo ID
router.get("/:id", userController.getUserById);

// Cập nhật thông tin cá nhân
router.put("/:id", userController.updateUser);

// Đổi mật khẩu
router.put("/:id/password", userController.changePassword);

// Khóa/mở khóa tài khoản (Admin)
router.patch("/:id/lock", userController.setLockStatus);

// Xóa người dùng
router.delete("/:id", userController.deleteUser);

module.exports = router;
