const express = require("express");
const congViecController = require("../controllers/congViecController");

const router = express.Router();

/**
 * Route: GET /api/tasks/user/:userId
 * Chức năng: Lấy danh sách toàn bộ công việc của một người dùng
 */
router.get("/user/:userId", congViecController.layCongViec);

/**
 * Route: GET /api/tasks/user/:userId/search
 * Chức năng: Tìm kiếm và lọc công việc theo các tiêu chí: từ khóa, trạng thái, mức độ ưu tiên, danh mục
 */
router.get("/user/:userId/search", congViecController.timKiemCongViec);

/**
 * Route: GET /api/tasks/user/:userId/stats
 * Chức năng: Lấy dữ liệu thống kê tổng quan về công việc (số lượng hoàn thành, đang làm, quá hạn...)
 */
router.get("/user/:userId/stats", congViecController.layThongKeCongViec);

/**
 * Route: GET /api/tasks/:id
 * Chức năng: Xem thông tin chi tiết của một công việc cụ thể theo ID
 */
router.get("/:id", congViecController.layCongViecTheoId);

/**
 * Route: POST /api/tasks/user/:userId
 * Chức năng: Thêm mới một công việc vào danh sách của người dùng
 */
router.post("/user/:userId", congViecController.taoCongViec);

/**
 * Route: PUT /api/tasks/:id/user/:userId
 * Chức năng: Cập nhật toàn bộ thông tin của một công việc (tiêu đề, mô tả, hạn chót, danh mục...)
 */
router.put("/:id/user/:userId", congViecController.capNhatCongViec);

/**
 * Route: PATCH /api/tasks/:id/user/:userId/status
 * Chức năng: Chỉ cập nhật trạng thái của công việc (ví dụ: đang làm -> hoàn thành)
 */
router.patch("/:id/user/:userId/status", congViecController.capNhatTrangThaiCongViec);

/**
 * Route: DELETE /api/tasks/:id/user/:userId
 * Chức năng: Xoá bỏ một công việc khỏi hệ thống
 */
router.delete("/:id/user/:userId", congViecController.xoaCongViec);

module.exports = router;