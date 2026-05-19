const express = require("express");
const thongBaoController = require("../controllers/thongBaoController");
const { xacThucToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(xacThucToken);

/**
 * Route: GET /api/notifications
 * Chức năng: Lấy danh sách toàn bộ thông báo của người dùng, sắp xếp theo thời gian mới nhất
 */
router.get("", thongBaoController.layThongBao);

/**
 * Route: GET /api/notifications/unread
 * Chức năng: Chỉ lấy danh sách các thông báo người dùng chưa đọc
 */
router.get("/unread", thongBaoController.layThongBaoChuaDoc);

/**
 * Route: GET /api/notifications/unread/count
 * Chức năng: Đếm số lượng thông báo chưa đọc để hiển thị badge (chấm đỏ) trên UI
 */
router.get("/unread/count", thongBaoController.demChuaDoc);

/**
 * Route: POST /api/notifications
 * Chức năng: Tạo một thông báo mới thủ công
 */
router.post("", thongBaoController.taoThongBao);

/**
 * Route: POST /api/notifications/reminders
 * Chức năng: Tự động kiểm tra và tạo thông báo nhắc nhở cho các công việc sắp đến hạn hoặc đã quá hạn
 */
router.post("/reminders", thongBaoController.taoNhacViec);

/**
 * Route: PATCH /api/notifications/read-all
 * Chức năng: Đánh dấu tất cả thông báo của người dùng thành trạng thái "đã đọc"
 */
router.patch("/read-all", thongBaoController.danhDauTatCaDaDoc);

/**
 * Route: PATCH /api/notifications/:id/read
 * Chức năng: Đánh dấu một thông báo cụ thể là "đã đọc"
 */
router.patch("/:id/read", thongBaoController.danhDauDaDoc);

/**
 * Route: DELETE /api/notifications/:id
 * Chức năng: Xoá một thông báo khỏi danh sách của người dùng
 */
router.delete("/:id", thongBaoController.xoaThongBao);

/**
 * Route: DELETE /api/notifications
 * Chức năng: Xoá tất cả thông báo của người dùng
 */
router.delete("/", thongBaoController.xoaTatCaThongBao);

module.exports = router;
