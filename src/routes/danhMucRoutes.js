const express = require("express");
const danhMucController = require("../controllers/danhMucController");
const { xacThucToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(xacThucToken);
/**
 * Route: GET /api/categories
 * Chức năng: Lấy danh sách tất cả các danh mục thuộc về một người dùng cụ thể
 */
router.get("", danhMucController.layDanhMuc);

/**
 * Route: GET /api/categories/:id
 * Chức năng: Xem thông tin chi tiết của một danh mục dựa theo ID
 */
router.get("/:id", danhMucController.layDanhMucTheoId);

/**
 * Route: POST /api/categories
 * Chức năng: Tạo một danh mục công việc mới cho người dùng
 */
router.post("", danhMucController.taoDanhMuc);

/**
 * Route: PUT /api/categories/:id
 * Chức năng: Chỉnh sửa tên hoặc thông tin của một danh mục hiện có
 */
router.put("/:id", danhMucController.capNhatDanhMuc);

/**
 * Route: DELETE /api/categories/:id
 * Chức năng: Xoá một danh mục. Các công việc thuộc danh mục này sẽ bị đặt category_id = null
 */
router.delete("/:id", danhMucController.xoaDanhMuc);

module.exports = router;
