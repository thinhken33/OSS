const express = require("express");
const nguoiDungController = require("../controllers/nguoiDungController");

const router = express.Router();

/**
 * Route: POST /api/users/register
 * Chức năng: Xử lý yêu cầu tạo tài khoản người dùng mới
 */
router.post("/register", nguoiDungController.dangKy);

/**
 * Route: POST /api/users/login
 * Chức năng: Xác thực thông tin đăng nhập và trả về thông tin người dùng
 */
router.post("/login", nguoiDungController.dangNhap);

/**
 * Route: GET /api/users/
 * Chức năng: Lấy danh sách toàn bộ người dùng trong hệ thống (Dành cho Quản trị viên - Admin)
 */
router.get("/", nguoiDungController.layTatCaNguoiDung);

/**
 * Route: GET /api/users/:id
 * Chức năng: Truy xuất thông tin chi tiết của một người dùng dựa theo ID
 */
router.get("/:id", nguoiDungController.layNguoiDungTheoId);

/**
 * Route: PUT /api/users/:id
 * Chức năng: Cập nhật thông tin cá nhân (họ tên, ảnh đại diện, tiểu sử) của người dùng
 */
router.put("/:id", nguoiDungController.capNhatNguoiDung);

/**
 * Route: PUT /api/users/:id/password
 * Chức năng: Thay đổi mật khẩu tài khoản người dùng
 */
router.put("/:id/password", nguoiDungController.doiMatKhau);

/**
 * Route: PATCH /api/users/:id/lock
 * Chức năng: Khoá hoặc mở khoá tài khoản người dùng (Dành cho Quản trị viên - Admin)
 */
router.patch("/:id/lock", nguoiDungController.datTrangThaiKhoa);

/**
 * Route: DELETE /api/users/:id
 * Chức năng: Xoá hoàn toàn tài khoản người dùng khỏi hệ thống
 */
router.delete("/:id", nguoiDungController.xoaNguoiDung);

module.exports = router;
