const express = require("express");
const danhMucController = require("../controllers/danhMucController");

const router = express.Router();

/**
 * Route: GET /api/categories/user/:userId
 * Chức năng: Lấy danh sách tất cả các danh mục thuộc về một người dùng cụ thể
 */
router.get("/user/:userId", danhMucController.layDanhMuc);

/**
 * Route: GET /api/categories/:id
 * Chức năng: Xem thông tin chi tiết của một danh mục dựa theo ID
 */
router.get("/:id", danhMucController.layDanhMucTheoId);

/**
 * Route: POST /api/categories/user/:userId
 * Chức năng: Tạo một danh mục công việc mới cho người dùng
 */
router.post("/user/:userId", danhMucController.taoDanhMuc);

/**
 * Route: PUT /api/categories/:id/user/:userId
 * Chức năng: Chỉnh sửa tên hoặc thông tin của một danh mục hiện có
 */
router.put("/:id/user/:userId", danhMucController.capNhatDanhMuc);

/**
 * Route: DELETE /api/categories/:id/user/:userId
 * Chức năng: Xoá một danh mục. Các công việc thuộc danh mục này sẽ bị đặt category_id = null
 */
router.delete("/:id/user/:userId", danhMucController.xoaDanhMuc);

module.exports = router;
