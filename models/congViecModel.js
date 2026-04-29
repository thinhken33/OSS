const db = require("../config/db");

/**
 * Lấy tất cả công việc của một người dùng, kết hợp với bảng Categories để lấy thêm tên danh mục
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>} Danh sách công việc của người dùng
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
 * Lấy chi tiết một công việc theo ID, kèm theo tên danh mục
 * 
 * @param {number} maCongViec - ID công việc
 * @returns {Promise<Object|null>} Thông tin chi tiết công việc hoặc null
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
 * Tạo một công việc mới trong DB
 * 
 * @param {Object} duLieu - Chứa các thông tin của công việc (user_id, category_id, title...)
 * @returns {Promise<Object>} Công việc vừa tạo
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
 * Cập nhật toàn bộ thông tin của công việc
 * 
 * @param {number} maCongViec - ID công việc
 * @param {Object} duLieu - Các thông tin thay đổi
 * @returns {Promise<Object|null>} Công việc sau khi cập nhật hoặc null
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
 * Chỉ cập nhật trạng thái làm việc của công việc và thời điểm hoàn thành
 * 
 * @param {number} maCongViec - ID công việc
 * @param {string} trangThai - Trạng thái mới (ví dụ 'completed', 'in_progress')
 * @param {string|null} thoiDiemHoanThanh - Timestamp lúc hoàn thành (nếu status = 'completed')
 * @returns {Promise<Object|null>}
 */
async function capNhatTrangThaiCongViec(maCongViec, trangThai, thoiDiemHoanThanh) {
  const ketQua = await db.truyVan(
    `UPDATE Tasks SET status = $1, completed_at = $2 WHERE task_id = $3 RETURNING *`,
    [trangThai, thoiDiemHoanThanh || null, maCongViec]
  );
  return ketQua.rows[0] || null;
}

/**
 * Xoá một công việc khỏi cơ sở dữ liệu
 * 
 * @param {number} maCongViec - ID công việc
 * @returns {Promise<boolean>} true nếu xoá thành công, ngược lại false
 */
async function xoaCongViec(maCongViec) {
  const ketQua = await db.truyVan(
    `DELETE FROM Tasks WHERE task_id = $1 RETURNING task_id`,
    [maCongViec]
  );
  return ketQua.rowCount > 0;
}

/**
 * Tìm kiếm và lọc công việc theo các tham số
 * (Hỗ trợ tìm qua tựa đề, lọc qua trạng thái, mức độ ưu tiên, danh mục, hạn chót)
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @param {Object} boLoc - Đối tượng chứa thông tin tìm kiếm
 * @returns {Promise<Array>}
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
 * Truy vấn danh sách công việc sắp đến hạn hoặc đã quá hạn của một người dùng
 * (Phục vụ cho việc tạo thông báo nhắc nhở tự động)
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>} Danh sách công việc
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
 * Tự động tìm và cập nhật trạng thái các công việc đã hết hạn
 * (Được gọi định kỳ bởi cron job ở server.js)
 * 
 * @returns {Promise<Array>} Danh sách các công việc vừa được cập nhật thành quá hạn
 */
async function danhDauCongViecQuaHan() {
  const ketQua = await db.truyVan(
    `UPDATE Tasks
     SET status = 'overdue'
     WHERE status IN ('pending', 'in_progress')
       AND due_date IS NOT NULL
       AND due_date < NOW()
     RETURNING *`
  );
  return ketQua.rows;
}

/**
 * Thống kê lượng công việc theo trạng thái cho một người dùng
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Object>} Thống kê số lượng (tổng, đang xử lý, đã hoàn thành...)
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