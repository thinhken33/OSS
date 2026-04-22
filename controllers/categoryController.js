const categoryService = require("../services/categoryService");

/**
 * Lấy tất cả danh mục của user
 */
async function getCategories(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const categories = await categoryService.getCategoriesByUserId(userId);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message || "Không lấy được danh mục." });
  }
}

/**
 * Lấy danh mục theo ID
 */
async function getCategoryById(req, res) {
  try {
    const category = await categoryService.getCategoryById(parseInt(req.params.id));
    res.json(category);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Tạo danh mục mới
 */
async function createCategory(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const category = await categoryService.createCategory(userId, req.body);
    res.status(201).json({
      message: "Tạo danh mục thành công.",
      category,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Cập nhật danh mục
 */
async function updateCategory(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const category = await categoryService.updateCategory(parseInt(req.params.id), userId, req.body);
    res.json({
      message: "Cập nhật danh mục thành công.",
      category,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Xóa danh mục
 */
async function deleteCategory(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const category = await categoryService.deleteCategory(parseInt(req.params.id), userId);
    res.json({
      message: "Đã xóa danh mục.",
      category,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
