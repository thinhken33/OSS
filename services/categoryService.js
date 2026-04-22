const categoryModel = require("../models/categoryModel");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Lấy tất cả danh mục của user
 */
async function getCategoriesByUserId(userId) {
  return await categoryModel.getCategoriesByUserId(userId);
}

/**
 * Lấy danh mục theo ID
 */
async function getCategoryById(id) {
  const category = await categoryModel.getCategoryById(id);
  if (!category) {
    throw createError("Không tìm thấy danh mục.", 404);
  }
  return category;
}

/**
 * Tạo danh mục mới
 */
async function createCategory(userId, { name }) {
  // Validate
  if (!name || !name.trim()) {
    throw createError("Tên danh mục không được để trống.", 400);
  }

  // Kiểm tra trùng tên
  const existing = await categoryModel.getCategoryByName(userId, name.trim());
  if (existing) {
    throw createError("Tên danh mục đã tồn tại.", 409);
  }

  return await categoryModel.createCategory({
    user_id: userId,
    name: name.trim(),
  });
}

/**
 * Cập nhật danh mục
 */
async function updateCategory(id, userId, { name }) {
  if (!name || !name.trim()) {
    throw createError("Tên danh mục không được để trống.", 400);
  }

  // Kiểm tra danh mục có tồn tại
  const category = await categoryModel.getCategoryById(id);
  if (!category) {
    throw createError("Không tìm thấy danh mục để sửa.", 404);
  }

  // Kiểm tra quyền sở hữu
  if (category.user_id !== userId) {
    throw createError("Bạn không có quyền sửa danh mục này.", 403);
  }

  // Kiểm tra trùng tên (trừ chính nó)
  const existing = await categoryModel.getCategoryByName(userId, name.trim());
  if (existing && existing.category_id !== id) {
    throw createError("Tên danh mục đã tồn tại.", 409);
  }

  return await categoryModel.updateCategory(id, { name: name.trim() });
}

/**
 * Xóa danh mục
 */
async function deleteCategory(id, userId) {
  const category = await categoryModel.getCategoryById(id);
  if (!category) {
    throw createError("Không tìm thấy danh mục để xóa.", 404);
  }

  // Kiểm tra quyền sở hữu
  if (category.user_id !== userId) {
    throw createError("Bạn không có quyền xóa danh mục này.", 403);
  }

  await categoryModel.deleteCategory(id);
  return category;
}

module.exports = {
  getCategoriesByUserId,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
