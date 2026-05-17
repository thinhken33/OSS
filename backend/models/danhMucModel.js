const db = require("../config/db");

/**
 * Lấy danh sách tất cả danh mục của một người dùng
 * 
 * @param {number} maNguoiDung - ID của người dùng
 * @returns {Promise<Array>} Danh sách các danh mục, sắp xếp mới nhất lên đầu
 */
async function layDanhMucTheoNguoiDung(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Categories WHERE user_id = $1 ORDER BY created_at DESC`,
    [maNguoiDung]
  );
  return ketQua.rows;
}

/**
 * Lấy thông tin một danh mục dựa theo ID
 * 
 * @param {number} maDanhMuc - ID của danh mục
 * @returns {Promise<Object|null>} Đối tượng danh mục hoặc null nếu không tìm thấy
 */
async function layDanhMucTheoId(maDanhMuc) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Categories WHERE category_id = $1`,
    [maDanhMuc]
  );
  return ketQua.rows[0] || null;
}

/**
 * Kiểm tra xem người dùng đã có danh mục nào trùng tên hay chưa (không phân biệt hoa/thường)
 * 
 * @param {number} maNguoiDung - ID của người dùng
 * @param {string} tenDanhMuc - Tên danh mục cần kiểm tra
 * @returns {Promise<Object|null>} Đối tượng danh mục nếu trùng tên, ngược lại null
 */
async function layDanhMucTheoTen(maNguoiDung, tenDanhMuc) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Categories WHERE user_id = $1 AND LOWER(name) = LOWER($2)`,
    [maNguoiDung, tenDanhMuc]
  );
  return ketQua.rows[0] || null;
}

/**
 * Tạo một danh mục công việc mới trong DB
 * 
 * @param {Object} duLieu - Chứa user_id và name của danh mục mới
 * @returns {Promise<Object>} Danh mục vừa được tạo
 */
async function taoDanhMuc({ user_id, name, icon }) {
  const ketQua = await db.truyVan(
    `INSERT INTO Categories (user_id, name, icon)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, name, icon || null]
  );
  return ketQua.rows[0];
}

/**
 * Cập nhật tên của một danh mục
 * 
 * @param {number} maDanhMuc - ID danh mục cần cập nhật
 * @param {Object} duLieu - Đối tượng chứa thuộc tính name mới
 * @returns {Promise<Object|null>} Danh mục sau khi cập nhật hoặc null
 */
async function capNhatDanhMuc(maDanhMuc, { name, icon }) {
  const ketQua = await db.truyVan(
    `UPDATE Categories SET name = $1, icon = $2 WHERE category_id = $3 RETURNING *`,
    [name, icon || null, maDanhMuc]
  );
  return ketQua.rows[0] || null;
}

/**
 * Gỡ danh mục khỏi toàn bộ công việc đang gán danh mục đó
 * (task không bị xóa, chỉ đưa category_id về null)
 *
 * @param {number} maDanhMuc - ID danh mục
 * @returns {Promise<number>} Số công việc được cập nhật
 */
async function boGanDanhMucKhoiCongViec(maDanhMuc) {
  const ketQua = await db.truyVan(
    `UPDATE Tasks
     SET category_id = NULL
     WHERE category_id = $1`,
    [maDanhMuc],
  );
  return ketQua.rowCount || 0;
}

/**
 * Xoá một danh mục khỏi DB
 * 
 * @param {number} maDanhMuc - ID danh mục cần xoá
 * @returns {Promise<boolean>} Trả về true nếu xoá thành công, ngược lại false
 */
async function xoaDanhMuc(maDanhMuc) {
  const ketQua = await db.truyVan(
    `DELETE FROM Categories WHERE category_id = $1 RETURNING category_id`,
    [maDanhMuc]
  );
  return ketQua.rowCount > 0;
}

module.exports = {
  layDanhMucTheoNguoiDung,
  layDanhMucTheoId,
  layDanhMucTheoTen,
  taoDanhMuc,
  capNhatDanhMuc,
  boGanDanhMucKhoiCongViec,
  xoaDanhMuc,
};
