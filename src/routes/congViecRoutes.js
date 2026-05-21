const express = require("express");
const congViecController = require("../controllers/congViecController");
const { xacThucToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Áp dụng middleware cho tất cả các routes của công việc
router.use(xacThucToken);

/**
 * Route: GET /api/tasks
 * Chức năng: Lấy danh sách toàn bộ công việc của một người dùng
 */
router.get("", congViecController.layCongViec);

/**
 * Route: GET /api/tasks/search
 * Chức năng: Tìm kiếm và lọc công việc theo các tiêu chí: từ khóa, trạng thái, mức độ ưu tiên, danh mục
 */
router.get("/search", congViecController.timKiemCongViec);

/**
 * Route: GET /api/tasks/stats
 * Chức năng: Lấy dữ liệu thống kê tổng quan về công việc (số lượng hoàn thành, đang làm, quá hạn...)
 */
router.get("/stats", congViecController.layThongKeCongViec);

/**
 * Route: GET /api/tasks/:id
 * Chức năng: Xem thông tin chi tiết của một công việc cụ thể theo ID
 */
router.get("/:id", congViecController.layCongViecTheoId);

/**
 * Route: POST /api/tasks
 * Chức năng: Thêm mới một công việc vào danh sách của người dùng
 */
router.post("", congViecController.taoCongViec);

/**
 * Route: PUT /api/tasks/:id
 * Chức năng: Cập nhật toàn bộ thông tin của một công việc (tiêu đề, mô tả, hạn chót, danh mục...)
 */
router.put("/:id", congViecController.capNhatCongViec);

/**
 * Route: PATCH /api/tasks/:id/status
 * Chức năng: Chỉ cập nhật trạng thái của công việc (ví dụ: đang làm -> hoàn thành)
 */
router.patch("/:id/status", congViecController.capNhatTrangThaiCongViec);

/**
 * Route: DELETE /api/tasks/:id
 * Chức năng: Xoá bỏ một công việc khỏi hệ thống
 */
router.delete("/:id", congViecController.xoaCongViec);

module.exports = router;
