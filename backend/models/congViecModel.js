const db = require("../config/db");

async function layCongViecTheoNguoiDung(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT t.*, c.name AS category_name
     FROM Tasks t
     LEFT JOIN Categories c ON t.category_id = c.category_id
     WHERE t.user_id = $1
     ORDER BY t.created_at DESC`,
    [maNguoiDung],
  );
  return ketQua.rows;
}

async function layCongViecTheoId(maCongViec) {
  const ketQua = await db.truyVan(
    `SELECT t.*, c.name AS category_name
     FROM Tasks t
     LEFT JOIN Categories c ON t.category_id = c.category_id
     WHERE t.task_id = $1`,
    [maCongViec],
  );
  return ketQua.rows[0] || null;
}

async function taoCongViec({
  user_id,
  category_id,
  title,
  description,
  start_date,
  due_date,
  priority,
  status,
  completed_at,
  reminder_minutes,
  reminder_sent_at,
  due_soon_sent_at,
}) {
  const ketQua = await db.truyVan(
    `INSERT INTO Tasks (
      user_id, category_id, title, description, start_date, due_date,
      priority, status, completed_at, reminder_minutes, reminder_sent_at, due_soon_sent_at
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      user_id,
      category_id || null,
      title,
      description || null,
      start_date || null,
      due_date || null,
      priority || "medium",
      status || "pending",
      completed_at || null,
      reminder_minutes ?? 0,
      reminder_sent_at || null,
      due_soon_sent_at || null,
    ],
  );
  return ketQua.rows[0];
}

async function capNhatCongViec(
  maCongViec,
  {
    category_id,
    title,
    description,
    start_date,
    due_date,
    priority,
    status,
    completed_at,
    reminder_minutes,
    reminder_sent_at,
    due_soon_sent_at,
  },
) {
  const ketQua = await db.truyVan(
    `UPDATE Tasks
     SET category_id = $1,
         title = $2,
         description = $3,
         start_date = $4,
         due_date = $5,
         priority = $6,
         status = $7,
         completed_at = $8,
         reminder_minutes = $9,
         reminder_sent_at = $10,
         due_soon_sent_at = $11
     WHERE task_id = $12
     RETURNING *`,
    [
      category_id || null,
      title,
      description || null,
      start_date || null,
      due_date || null,
      priority,
      status,
      completed_at || null,
      reminder_minutes ?? 0,
      reminder_sent_at || null,
      due_soon_sent_at || null,
      maCongViec,
    ],
  );
  return ketQua.rows[0] || null;
}

async function capNhatTrangThaiCongViec(
  maCongViec,
  trangThai,
  thoiDiemHoanThanh,
  reminderSentAt,
  dueSoonSentAt,
) {
  const ketQua = await db.truyVan(
    `UPDATE Tasks
     SET status = $1,
         completed_at = $2,
         reminder_sent_at = $3,
         due_soon_sent_at = $4
     WHERE task_id = $5
     RETURNING *`,
    [trangThai, thoiDiemHoanThanh || null, reminderSentAt || null, dueSoonSentAt || null, maCongViec],
  );
  return ketQua.rows[0] || null;
}

async function xoaCongViec(maCongViec) {
  const ketQua = await db.truyVan(
    `DELETE FROM Tasks WHERE task_id = $1 RETURNING task_id`,
    [maCongViec],
  );
  return ketQua.rowCount > 0;
}

async function timKiemCongViec(
  maNguoiDung,
  { tuKhoa, trangThai, mucUuTien, maDanhMuc, hanHoanThanh },
) {
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

async function layCongViecQuaHanVaSapDenHan(maNguoiDung) {
  const ketQua = await db.truyVan(
    `SELECT * FROM Tasks
     WHERE user_id = $1
       AND status NOT IN ('completed')
       AND due_date IS NOT NULL
       AND due_date <= NOW() + INTERVAL '1 day'
     ORDER BY due_date ASC`,
    [maNguoiDung],
  );
  return ketQua.rows;
}

async function layCongViecDenMocNhac(maNguoiDung = null) {
  const coLocTheoUser = maNguoiDung !== null && maNguoiDung !== undefined;
  if (coLocTheoUser && (!Number.isInteger(maNguoiDung) || maNguoiDung <= 0)) {
    return [];
  }
  const laTheoNguoiDung = coLocTheoUser;
  const cauTruyVan = `
    SELECT *
    FROM Tasks
    WHERE status IN ('pending', 'in_progress')
      AND due_date IS NOT NULL
      AND reminder_minutes IN (30, 60)
      AND reminder_sent_at IS NULL
      AND NOW() >= due_date - (reminder_minutes * INTERVAL '1 minute')
      AND NOW() < due_date
      ${laTheoNguoiDung ? "AND user_id = $1" : ""}
    ORDER BY due_date ASC
  `;
  const ketQua = await db.truyVan(cauTruyVan, laTheoNguoiDung ? [maNguoiDung] : []);
  return ketQua.rows;
}

async function layCongViecSapDenHan(maNguoiDung = null) {
  const coLocTheoUser = maNguoiDung !== null && maNguoiDung !== undefined;
  if (coLocTheoUser && (!Number.isInteger(maNguoiDung) || maNguoiDung <= 0)) {
    return [];
  }

  const cauTruyVan = `
    SELECT *
    FROM Tasks
    WHERE status IN ('pending', 'in_progress')
      AND due_date IS NOT NULL
      AND due_soon_sent_at IS NULL
      AND NOW() >= due_date - INTERVAL '24 hours'
      AND NOW() < due_date
      ${coLocTheoUser ? "AND user_id = $1" : ""}
    ORDER BY due_date ASC
  `;

  const ketQua = await db.truyVan(cauTruyVan, coLocTheoUser ? [maNguoiDung] : []);
  return ketQua.rows;
}

async function danhDauDaGuiNhacViec(maCongViec) {
  const ketQua = await db.truyVan(
    `UPDATE Tasks
     SET reminder_sent_at = NOW()
     WHERE task_id = $1
       AND reminder_sent_at IS NULL
     RETURNING *`,
    [maCongViec],
  );
  return ketQua.rows[0] || null;
}

async function danhDauDaGuiThongBaoSapDenHan(maCongViec) {
  const ketQua = await db.truyVan(
    `UPDATE Tasks
     SET due_soon_sent_at = NOW()
     WHERE task_id = $1
       AND due_soon_sent_at IS NULL
     RETURNING *`,
    [maCongViec],
  );
  return ketQua.rows[0] || null;
}

async function danhDauCongViecQuaHan() {
  const ketQua = await db.truyVan(
    `UPDATE Tasks
     SET status = 'overdue'
     WHERE status IN ('pending', 'in_progress')
       AND due_date IS NOT NULL
       AND due_date < NOW()
     RETURNING *`,
  );
  return ketQua.rows;
}

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
    [maNguoiDung],
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
  layCongViecDenMocNhac,
  layCongViecSapDenHan,
  danhDauDaGuiNhacViec,
  danhDauDaGuiThongBaoSapDenHan,
  danhDauCongViecQuaHan,
  layThongKeCongViec,
};
