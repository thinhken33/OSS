const db = require("../config/db");

/**
 * Lấy toàn bộ thông báo của một người dùng, kèm theo tiêu đề công việc (nếu có)
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>} Danh sách các thông báo
 */
async function layThongBaoTheoNguoiDung(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT n.*, t.title AS task_title
     FROM Notifications n
     LEFT JOIN Tasks t ON n.task_id = t.task_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC`,
    [maNguoiDung]
  );
  return ketQua.rows;
}

/**
 * Chỉ lấy các thông báo trạng thái chưa đọc (is_read = FALSE) của người dùng
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>} Danh sách thông báo chưa đọc
 */
async function layThongBaoChuaDoc(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT n.*, t.title AS task_title
     FROM Notifications n
     LEFT JOIN Tasks t ON n.task_id = t.task_id
     WHERE n.user_id = $1 AND n.is_read = FALSE
     ORDER BY n.created_at DESC`,
    [maNguoiDung]
  );
  return ketQua.rows;
}

/**
 * Đếm số lượng thông báo chưa đọc của người dùng để làm hiển thị cho badge
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<number>} Số lượng thông báo chưa đọc
 */
async function demThongBaoChuaDoc(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT COUNT(*) AS so_luong FROM Notifications WHERE user_id = $1 AND is_read = FALSE`,
    [maNguoiDung]
  );
  return parseInt(ketQua.rows[0].so_luong);
}

/**
 * Lấy thông tin chi tiết một thông báo qua ID của thông báo
 * 
 * @param {number} maThongBao - ID thông báo
 * @returns {Promise<Object|null>} Dữ liệu thông báo hoặc null
 */
async function layThongBaoTheoId(maThongBao) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Notifications WHERE notification_id = $1`,
    [maThongBao]
  );
  return ketQua.rows[0] || null;
}

/**
 * Tạo một thông báo mới trong cơ sở dữ liệu
 * 
 * @param {Object} duLieu - Chứa user_id, task_id (có thể null), message
 * @returns {Promise<Object>} Thông báo vừa tạo
 */
async function taoThongBao({ user_id, task_id, message }) {
  const ketQua = await db.truyVan(
    `INSERT INTO Notifications (user_id, task_id, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, task_id || null, message]
  );
  return ketQua.rows[0];
}

/**
 * Cập nhật trạng thái một thông báo từ chưa đọc thành "đã đọc"
 * 
 * @param {number} maThongBao - ID của thông báo
 * @returns {Promise<Object|null>} Thông báo sau cập nhật hoặc null
 */
async function danhDauDaDoc(maThongBao) {
  const ketQua = await db.truyVan(
    `UPDATE Notifications SET is_read = TRUE WHERE notification_id = $1 RETURNING *`,
    [maThongBao]
  );
  return ketQua.rows[0] || null;
}

/**
 * Đánh dấu toàn bộ các thông báo của một người dùng là "đã đọc"
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>} Danh sách các thông báo đã được cập nhật
 */
async function danhDauTatCaDaDoc(maNguoiDung) {
  const ketQua = await db.truyVan(
    `UPDATE Notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE RETURNING *`,
    [maNguoiDung]
  );
  return ketQua.rows;
}

/**
 * Xoá một thông báo khỏi cơ sở dữ liệu
 * 
 * @param {number} maThongBao - ID thông báo cần xoá
 * @returns {Promise<boolean>} true nếu xoá thành công, ngược lại false
 */
async function xoaThongBao(maThongBao) {
  const ketQua = await db.truyVan(
    `DELETE FROM Notifications WHERE notification_id = $1 RETURNING notification_id`,
    [maThongBao]
  );
  return ketQua.rowCount > 0;
}

module.exports = {
  layThongBaoTheoNguoiDung,
  layThongBaoChuaDoc,
  demThongBaoChuaDoc,
  layThongBaoTheoId,
  taoThongBao,
  danhDauDaDoc,
  danhDauTatCaDaDoc,
  xoaThongBao,
};
