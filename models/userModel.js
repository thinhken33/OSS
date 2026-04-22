const db = require("../config/db");

/**
 * Lấy tất cả người dùng (không trả password_hash)
 */
async function getAllUsers() {
  const result = await db.query(
    `SELECT user_id, full_name, email, avatar_url, bio, role, is_locked, created_at
     FROM Users ORDER BY created_at DESC`
  );
  return result.rows;
}

/**
 * Lấy người dùng theo ID
 */
async function getUserById(id) {
  const result = await db.query(
    `SELECT user_id, full_name, email, avatar_url, bio, role, is_locked, created_at
     FROM Users WHERE user_id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Lấy người dùng theo email (bao gồm password_hash để xác thực)
 */
async function getUserByEmail(email) {
  const result = await db.query(
    `SELECT * FROM Users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Tạo người dùng mới
 */
async function createUser({ full_name, email, password_hash, avatar_url, bio }) {
  const result = await db.query(
    `INSERT INTO Users (full_name, email, password_hash, avatar_url, bio)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, full_name, email, avatar_url, bio, role, is_locked, created_at`,
    [full_name, email, password_hash, avatar_url || null, bio || null]
  );
  return result.rows[0];
}

/**
 * Cập nhật thông tin người dùng
 */
async function updateUser(id, { full_name, avatar_url, bio }) {
  const result = await db.query(
    `UPDATE Users
     SET full_name = $1, avatar_url = $2, bio = $3
     WHERE user_id = $4
     RETURNING user_id, full_name, email, avatar_url, bio, role, is_locked, created_at`,
    [full_name, avatar_url || null, bio || null, id]
  );
  return result.rows[0] || null;
}

/**
 * Cập nhật mật khẩu
 */
async function updatePassword(id, password_hash) {
  const result = await db.query(
    `UPDATE Users SET password_hash = $1 WHERE user_id = $2 RETURNING user_id`,
    [password_hash, id]
  );
  return result.rows[0] || null;
}

/**
 * Khóa / mở khóa tài khoản (Admin)
 */
async function setLockStatus(id, is_locked) {
  const result = await db.query(
    `UPDATE Users SET is_locked = $1 WHERE user_id = $2
     RETURNING user_id, full_name, email, role, is_locked`,
    [is_locked, id]
  );
  return result.rows[0] || null;
}

/**
 * Xóa người dùng
 */
async function deleteUser(id) {
  const result = await db.query(
    `DELETE FROM Users WHERE user_id = $1 RETURNING user_id`,
    [id]
  );
  return result.rowCount > 0;
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  updatePassword,
  setLockStatus,
  deleteUser,
};
