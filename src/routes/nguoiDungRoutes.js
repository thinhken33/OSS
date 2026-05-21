const express = require("express");
const nguoiDungController = require("../controllers/nguoiDungController");
const {
  xacThucToken,
  baoVeTaiNguyen,
  xacThucAdmin,
} = require("../middlewares/authMiddleware");
const { uploadAvatar } = require("../middlewares/uploadMiddleware");

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
router.get(
  "/",
  xacThucToken,
  xacThucAdmin,
  nguoiDungController.layTatCaNguoiDung,
);

/**
 * Route: GET /api/users/:id
 * Chức năng: Truy xuất thông tin chi tiết của một người dùng dựa theo ID
 */
router.get(
  "/:id",
  xacThucToken,
  baoVeTaiNguyen,
  nguoiDungController.layNguoiDungTheoId,
);

/**
 * Route: PUT /api/users/:id
 * Chức năng: Cập nhật thông tin cá nhân (họ tên, ảnh đại diện, tiểu sử) của người dùng
 */
router.put(
  "/:id",
  xacThucToken,
  baoVeTaiNguyen,
  nguoiDungController.capNhatNguoiDung,
);

/**
 * Route: POST /api/users/:id/avatar
 * Chức năng: Tải lên ảnh đại diện cho người dùng
 */
router.post(
  "/:id/avatar",
  xacThucToken,
  baoVeTaiNguyen,
  uploadAvatar.single("avatar"),
  nguoiDungController.taiLenAvatar,
);

/**
 * Route: DELETE /api/users/:id/avatar
 * Chức năng: Xóa ảnh đại diện của người dùng
 */
router.delete(
  "/:id/avatar",
  xacThucToken,
  baoVeTaiNguyen,
  nguoiDungController.xoaAvatar,
);

/**
 * Route: PUT /api/users/:id/password
 * Chức năng: Thay đổi mật khẩu tài khoản người dùng
 */
router.put(
  "/:id/password",
  xacThucToken,
  baoVeTaiNguyen,
  nguoiDungController.doiMatKhau,
);

/**
 * Route: PATCH /api/users/:id/lock
 * Chức năng: Khoá hoặc mở khoá tài khoản người dùng (Dành cho Quản trị viên - Admin)
 */
router.patch(
  "/:id/lock",
  xacThucToken,
  xacThucAdmin,
  nguoiDungController.datTrangThaiKhoa,
);

/**
 * Route: DELETE /api/users/:id
 * Chức năng: Xoá hoàn toàn tài khoản người dùng khỏi hệ thống
 */
router.delete(
  "/:id",
  xacThucToken,
  baoVeTaiNguyen,
  nguoiDungController.xoaNguoiDung,
);

module.exports = router;
