const db = require("../config/db");

/**
 * Lay tat ca nguoi dung (khong tra password_hash)
 */
async function layTatCaNguoiDung() {
  const ketQua = await db.truyVan(
    `SELECT user_id, full_name, email, avatar_url, bio, role, is_locked, created_at
     FROM Users ORDER BY created_at DESC`
  );
  return ketQua.rows;
}

/**
 * Lay nguoi dung theo ID
 */
async function layNguoiDungTheoId(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT user_id, full_name, email, avatar_url, bio, role, is_locked, created_at
     FROM Users WHERE user_id = $1`,
    [maNguoiDung]
  );
  return ketQua.rows[0] || null;
}

/**
 * Lay nguoi dung theo email (bao gom password_hash de xac thuc)
 */
async function layNguoiDungTheoEmail(email) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Users WHERE email = $1`,
    [email]
  );
  return ketQua.rows[0] || null;
}

/**
 * Tao nguoi dung moi
 */
async function taoNguoiDung({ full_name, email, password_hash, avatar_url, bio }) {
  const ketQua = await db.truyVan(
    `INSERT INTO Users (full_name, email, password_hash, avatar_url, bio)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, full_name, email, avatar_url, bio, role, is_locked, created_at`,
    [full_name, email, password_hash, avatar_url || null, bio || null]
  );
  return ketQua.rows[0];
}

/**
 * Cap nhat thong tin nguoi dung
 */
async function capNhatNguoiDung(maNguoiDung, { full_name, avatar_url, bio }) {
  const ketQua = await db.truyVan(
    `UPDATE Users
     SET full_name = $1, avatar_url = $2, bio = $3
     WHERE user_id = $4
     RETURNING user_id, full_name, email, avatar_url, bio, role, is_locked, created_at`,
    [full_name, avatar_url || null, bio || null, maNguoiDung]
  );
  return ketQua.rows[0] || null;
}

/**
 * Cap nhat mat khau
 */
async function capNhatMatKhau(maNguoiDung, matKhauHash) {
  const ketQua = await db.truyVan(
    `UPDATE Users SET password_hash = $1 WHERE user_id = $2 RETURNING user_id`,
    [matKhauHash, maNguoiDung]
  );
  return ketQua.rows[0] || null;
}

/**
 * Khoa / mo khoa tai khoan (Admin)
 */
async function datTrangThaiKhoa(maNguoiDung, daKhoa) {
  const ketQua = await db.truyVan(
    `UPDATE Users SET is_locked = $1 WHERE user_id = $2
     RETURNING user_id, full_name, email, role, is_locked`,
    [daKhoa, maNguoiDung]
  );
  return ketQua.rows[0] || null;
}

/**
 * Xoa nguoi dung
 */
async function xoaNguoiDung(maNguoiDung) {
  const ketQua = await db.truyVan(
    `DELETE FROM Users WHERE user_id = $1 RETURNING user_id`,
    [maNguoiDung]
  );
  return ketQua.rowCount > 0;
}

module.exports = {
  layTatCaNguoiDung,
  layNguoiDungTheoId,
  layNguoiDungTheoEmail,
  taoNguoiDung,
  capNhatNguoiDung,
  capNhatMatKhau,
  datTrangThaiKhoa,
  xoaNguoiDung,
};
