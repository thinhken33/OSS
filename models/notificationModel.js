const db = require("../config/db");

/**
 * Lay tat ca thong bao cua nguoi dung
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
 * Lay thong bao chua doc cua nguoi dung
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
 * Dem so thong bao chua doc
 */
async function demThongBaoChuaDoc(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT COUNT(*) AS so_luong FROM Notifications WHERE user_id = $1 AND is_read = FALSE`,
    [maNguoiDung]
  );
  return parseInt(ketQua.rows[0].so_luong);
}

/**
 * Lay thong bao theo ID
 */
async function layThongBaoTheoId(maThongBao) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Notifications WHERE notification_id = $1`,
    [maThongBao]
  );
  return ketQua.rows[0] || null;
}

/**
 * Tao thong bao moi
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
 * Danh dau da doc mot thong bao
 */
async function danhDauDaDoc(maThongBao) {
  const ketQua = await db.truyVan(
    `UPDATE Notifications SET is_read = TRUE WHERE notification_id = $1 RETURNING *`,
    [maThongBao]
  );
  return ketQua.rows[0] || null;
}

/**
 * Danh dau tat ca thong bao cua nguoi dung la da doc
 */
async function danhDauTatCaDaDoc(maNguoiDung) {
  const ketQua = await db.truyVan(
    `UPDATE Notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE RETURNING *`,
    [maNguoiDung]
  );
  return ketQua.rows;
}

/**
 * Xoa thong bao
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
