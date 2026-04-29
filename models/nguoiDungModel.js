const db = require("../config/db");

/**
 * Lấy danh sách tất cả người dùng (không bao gồm password_hash vì lý do bảo mật)
 * Dành cho giao diện quản trị viên
 * 
 * @returns {Promise<Array>} Danh sách người dùng
 */
async function layTatCaNguoiDung() {
  const ketQua = await db.truyVan(
    `SELECT user_id, full_name, email, avatar_url, bio, role, is_locked, created_at
     FROM Users ORDER BY created_at DESC`
  );
  return ketQua.rows;
}

/**
 * Lấy thông tin người dùng theo ID (không bao gồm password_hash)
 * 
 * @param {number} maNguoiDung - ID của người dùng
 * @returns {Promise<Object|null>} Dữ liệu người dùng hoặc null
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
 * Lấy thông tin người dùng theo email (Bao gồm CẢ password_hash)
 * Phục vụ cho quá trình xác thực mật khẩu khi đăng nhập
 * 
 * @param {string} email - Email người dùng cần tìm
 * @returns {Promise<Object|null>} Dữ liệu người dùng đầy đủ hoặc null
 */
async function layNguoiDungTheoEmail(email) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Users WHERE email = $1`,
    [email]
  );
  return ketQua.rows[0] || null;
}

/**
 * Tạo người dùng mới trong DB khi đăng ký
 * 
 * @param {Object} duLieu - Chứa full_name, email, password_hash, avatar_url, bio
 * @returns {Promise<Object>} Dữ liệu người dùng vừa tạo (không bao gồm password_hash)
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
 * Cập nhật thông tin cá nhân của người dùng
 * 
 * @param {number} maNguoiDung - ID người dùng cần cập nhật
 * @param {Object} duLieu - Đối tượng chứa full_name, avatar_url, bio
 * @returns {Promise<Object|null>} Dữ liệu người dùng sau cập nhật hoặc null
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
 * Cập nhật chuỗi băm mật khẩu (password_hash) cho người dùng
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @param {string} matKhauHash - Chuỗi mật khẩu đã được băm
 * @returns {Promise<Object|null>} Trả về thông tin ID hoặc null
 */
async function capNhatMatKhau(maNguoiDung, matKhauHash) {
  const ketQua = await db.truyVan(
    `UPDATE Users SET password_hash = $1 WHERE user_id = $2 RETURNING user_id`,
    [matKhauHash, maNguoiDung]
  );
  return ketQua.rows[0] || null;
}

/**
 * Thay đổi trạng thái khoá/mở khoá của một tài khoản
 * Chỉ quyền Quản trị viên mới được thực thi chức năng này
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @param {boolean} daKhoa - true (khoá), false (mở khoá)
 * @returns {Promise<Object|null>} Dữ liệu người dùng sau cập nhật trạng thái
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
 * Xoá hoàn toàn người dùng khỏi cơ sở dữ liệu
 * Do ràng buộc ON DELETE CASCADE, mọi công việc và danh mục của người dùng cũng bị xoá
 * 
 * @param {number} maNguoiDung - ID người dùng cần xoá
 * @returns {Promise<boolean>} true nếu xoá thành công, ngược lại false
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
