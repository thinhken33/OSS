const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

// Lấy tất cả danh mục của user
router.get("/user/:userId", categoryController.getCategories);

// Lấy danh mục theo ID
router.get("/:id", categoryController.getCategoryById);

// Tạo danh mục mới
router.post("/user/:userId", categoryController.createCategory);

// Cập nhật danh mục
router.put("/:id/user/:userId", categoryController.updateCategory);

// Xóa danh mục
router.delete("/:id/user/:userId", categoryController.deleteCategory);

module.exports = router;
