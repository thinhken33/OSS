const db = require("../config/db");

/**
 * Lay tat ca cong viec cua mot nguoi dung (co kem ten danh muc)
 */
async function layCongViecTheoNguoiDung(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT t.*, c.name AS category_name
     FROM Tasks t
     LEFT JOIN Categories c ON t.category_id = c.category_id
     WHERE t.user_id = $1
     ORDER BY t.created_at DESC`,
    [maNguoiDung]
  );
  return ketQua.rows;
}

/**
 * Lay cong viec theo ID
 */
async function layCongViecTheoId(maCongViec) {
  const ketQua = await db.truyVan(
    `SELECT t.*, c.name AS category_name
     FROM Tasks t
     LEFT JOIN Categories c ON t.category_id = c.category_id
     WHERE t.task_id = $1`,
    [maCongViec]
  );
  return ketQua.rows[0] || null;
}

/**
 * Tao cong viec moi
 */
async function taoCongViec({ user_id, category_id, title, description, start_date, due_date, priority, status }) {
  const ketQua = await db.truyVan(
    `INSERT INTO Tasks (user_id, category_id, title, description, start_date, due_date, priority, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [user_id, category_id || null, title, description || null, start_date || null, due_date || null, priority || 'medium', status || 'pending']
  );
  return ketQua.rows[0];
}

/**
 * Cap nhat cong viec
 */
async function capNhatCongViec(maCongViec, { category_id, title, description, start_date, due_date, priority, status, completed_at }) {
  const ketQua = await db.truyVan(
    `UPDATE Tasks
     SET category_id = $1,
         title = $2,
         description = $3,
         start_date = $4,
         due_date = $5,
         priority = $6,
         status = $7,
         completed_at = $8
     WHERE task_id = $9
     RETURNING *`,
    [category_id || null, title, description || null, start_date || null, due_date || null, priority, status, completed_at || null, maCongViec]
  );
  return ketQua.rows[0] || null;
}

/**
 * Cap nhat trang thai cong viec
 */
async function capNhatTrangThaiCongViec(maCongViec, trangThai, thoiDiemHoanThanh) {
  const ketQua = await db.truyVan(
    `UPDATE Tasks SET status = $1, completed_at = $2 WHERE task_id = $3 RETURNING *`,
    [trangThai, thoiDiemHoanThanh || null, maCongViec]
  );
  return ketQua.rows[0] || null;
}

/**
 * Xoa cong viec
 */
async function xoaCongViec(maCongViec) {
  const ketQua = await db.truyVan(
    `DELETE FROM Tasks WHERE task_id = $1 RETURNING task_id`,
    [maCongViec]
  );
  return ketQua.rowCount > 0;
}

/**
 * Tim kiem va loc cong viec
 */
async function timKiemCongViec(maNguoiDung, { tuKhoa, trangThai, mucUuTien, maDanhMuc, hanHoanThanh }) {
  let cauTruyVan = `
    SELECT t.*, c.name AS category_name
    FROM Tasks t
    LEFT JOIN Categories c ON t.category_id = c.category_id
    WHERE t.user_id = $1
  `;
  const thamSo = [maNguoiDung];
  let chiSoThamSo = 2;

  if (tuKhoa) {
    cauTruyVan += ` AND (LOWER(t.title) LIKE LOWER($${chiSoThamSo}) OR LOWER(t.description) LIKE LOWER($${chiSoThamSo}))`;
    thamSo.push(`%${tuKhoa}%`);
    chiSoThamSo++;
  }

  if (trangThai) {
    cauTruyVan += ` AND t.status = $${chiSoThamSo}`;
    thamSo.push(trangThai);
    chiSoThamSo++;
  }

  if (mucUuTien) {
    cauTruyVan += ` AND t.priority = $${chiSoThamSo}`;
    thamSo.push(mucUuTien);
    chiSoThamSo++;
  }

  if (maDanhMuc) {
    cauTruyVan += ` AND t.category_id = $${chiSoThamSo}`;
    thamSo.push(maDanhMuc);
    chiSoThamSo++;
  }

  if (hanHoanThanh) {
    cauTruyVan += ` AND DATE(t.due_date) = $${chiSoThamSo}`;
    thamSo.push(hanHoanThanh);
    chiSoThamSo++;
  }

  cauTruyVan += ` ORDER BY t.due_date ASC NULLS LAST`;

  const ketQua = await db.truyVan(cauTruyVan, thamSo);
  return ketQua.rows;
}

/**
 * Lay cong viec sap den han hoac qua han (dung cho thong bao)
 */
async function layCongViecQuaHanVaSapDenHan(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Tasks
     WHERE user_id = $1
       AND status NOT IN ('completed')
       AND due_date IS NOT NULL
       AND due_date <= NOW() + INTERVAL '1 day'
     ORDER BY due_date ASC`,
    [maNguoiDung]
  );
  return ketQua.rows;
}

/**
 * Danh dau tu dong cac cong viec qua han
 */
async function danhDauCongViecQuaHan() {
  const ketQua = await db.truyVan(
    `UPDATE Tasks
     SET status = 'overdue'
     WHERE status IN ('pending', 'in_progress')
       AND due_date < NOW()
     RETURNING *`
  );
  return ketQua.rows;
}

/**
 * Lay thong ke cong viec cua nguoi dung
 */
async function layThongKeCongViec(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT
       COUNT(*) AS tong,
       COUNT(*) FILTER (WHERE status = 'pending') AS cho_xu_ly,
       COUNT(*) FILTER (WHERE status = 'in_progress') AS dang_lam,
       COUNT(*) FILTER (WHERE status = 'completed') AS hoan_thanh,
       COUNT(*) FILTER (WHERE status = 'overdue') AS qua_han
     FROM Tasks
     WHERE user_id = $1`,
    [maNguoiDung]
  );
  return ketQua.rows[0];
}

module.exports = {
  layCongViecTheoNguoiDung,
  layCongViecTheoId,
  taoCongViec,
  capNhatCongViec,
  capNhatTrangThaiCongViec,
  xoaCongViec,
  timKiemCongViec,
  layCongViecQuaHanVaSapDenHan,
  danhDauCongViecQuaHan,
  layThongKeCongViec,
};