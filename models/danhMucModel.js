const db = require("../config/db");

/**
 * Lay tat ca danh muc cua mot nguoi dung
 */
async function layDanhMucTheoNguoiDung(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Categories WHERE user_id = $1 ORDER BY created_at DESC`,
    [maNguoiDung]
  );
  return ketQua.rows;
}

/**
 * Lay danh muc theo ID
 */
async function layDanhMucTheoId(maDanhMuc) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Categories WHERE category_id = $1`,
    [maDanhMuc]
  );
  return ketQua.rows[0] || null;
}

/**
 * Kiem tra ten danh muc co bi trung khong (trong cung user)
 */
async function layDanhMucTheoTen(maNguoiDung, tenDanhMuc) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Categories WHERE user_id = $1 AND LOWER(name) = LOWER($2)`,
    [maNguoiDung, tenDanhMuc]
  );
  return ketQua.rows[0] || null;
}

/**
 * Tao danh muc moi
 */
async function taoDanhMuc({ user_id, name }) {
  const ketQua = await db.truyVan(
    `INSERT INTO Categories (user_id, name)
     VALUES ($1, $2)
     RETURNING *`,
    [user_id, name]
  );
  return ketQua.rows[0];
}

/**
 * Cap nhat danh muc
 */
async function capNhatDanhMuc(maDanhMuc, { name }) {
  const ketQua = await db.truyVan(
    `UPDATE Categories SET name = $1 WHERE category_id = $2 RETURNING *`,
    [name, maDanhMuc]
  );
  return ketQua.rows[0] || null;
}

/**
 * Xoa danh muc
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
  xoaDanhMuc,
};
