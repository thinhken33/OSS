const db = require("../config/db");

/**
 * Lấy tất cả danh mục của một người dùng
 */
async function getCategoriesByUserId(userId) {
  const result = await db.query(
    `SELECT * FROM Categories WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Lấy danh mục theo ID
 */
async function getCategoryById(id) {
  const result = await db.query(
    `SELECT * FROM Categories WHERE category_id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Kiểm tra tên danh mục có bị trùng không (trong cùng user)
 */
async function getCategoryByName(userId, name) {
  const result = await db.query(
    `SELECT * FROM Categories WHERE user_id = $1 AND LOWER(name) = LOWER($2)`,
    [userId, name]
  );
  return result.rows[0] || null;
}

/**
 * Tạo danh mục mới
 */
async function createCategory({ user_id, name }) {
  const result = await db.query(
    `INSERT INTO Categories (user_id, name)
     VALUES ($1, $2)
     RETURNING *`,
    [user_id, name]
  );
  return result.rows[0];
}

/**
 * Cập nhật danh mục
 */
async function updateCategory(id, { name }) {
  const result = await db.query(
    `UPDATE Categories SET name = $1 WHERE category_id = $2 RETURNING *`,
    [name, id]
  );
  return result.rows[0] || null;
}

/**
 * Xóa danh mục
 */
async function deleteCategory(id) {
  const result = await db.query(
    `DELETE FROM Categories WHERE category_id = $1 RETURNING category_id`,
    [id]
  );
  return result.rowCount > 0;
}

module.exports = {
  getCategoriesByUserId,
  getCategoryById,
  getCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory,
};
