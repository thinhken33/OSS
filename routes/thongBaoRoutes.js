const express = require("express");
const thongBaoController = require("../controllers/thongBaoController");

const router = express.Router();

/**
 * Route: GET /api/notifications/user/:userId
 * Chức năng: Lấy danh sách toàn bộ thông báo của người dùng, sắp xếp theo thời gian mới nhất
 */
router.get("/user/:userId", thongBaoController.layThongBao);

/**
 * Route: GET /api/notifications/user/:userId/unread
 * Chức năng: Chỉ lấy danh sách các thông báo người dùng chưa đọc
 */
router.get("/user/:userId/unread", thongBaoController.layThongBaoChuaDoc);

/**
 * Route: GET /api/notifications/user/:userId/unread/count
 * Chức năng: Đếm số lượng thông báo chưa đọc để hiển thị badge (chấm đỏ) trên UI
 */
router.get("/user/:userId/unread/count", thongBaoController.demChuaDoc);

/**
 * Route: POST /api/notifications/user/:userId
 * Chức năng: Tạo một thông báo mới thủ công
 */
router.post("/user/:userId", thongBaoController.taoThongBao);

/**
 * Route: POST /api/notifications/user/:userId/reminders
 * Chức năng: Tự động kiểm tra và tạo thông báo nhắc nhở cho các công việc sắp đến hạn hoặc đã quá hạn
 */
router.post("/user/:userId/reminders", thongBaoController.taoNhacViec);

/**
 * Route: PATCH /api/notifications/user/:userId/read-all
 * Chức năng: Đánh dấu tất cả thông báo của người dùng thành trạng thái "đã đọc"
 */
router.patch("/user/:userId/read-all", thongBaoController.danhDauTatCaDaDoc);

/**
 * Route: PATCH /api/notifications/:id/user/:userId/read
 * Chức năng: Đánh dấu một thông báo cụ thể là "đã đọc"
 */
router.patch("/:id/user/:userId/read", thongBaoController.danhDauDaDoc);

/**
 * Route: DELETE /api/notifications/:id/user/:userId
 * Chức năng: Xoá một thông báo khỏi danh sách của người dùng
 */
router.delete("/:id/user/:userId", thongBaoController.xoaThongBao);

module.exports = router;
