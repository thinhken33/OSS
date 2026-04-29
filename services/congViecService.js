const congViecModel = require("../models/congViecModel");

/**
 * Tiện ích: Tạo đối tượng lỗi với mã HTTP
 * 
 * @param {string} thongBao - Lời nhắn báo lỗi
 * @param {number} maLoi - Mã lỗi HTTP (400, 404,...)
 * @returns {Error}
 */
function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}

/**
 * Kiểm tra các ràng buộc dữ liệu đầu vào cho một công việc
 * 
 * @param {Object} duLieu - Dữ liệu công việc (title, status, priority, start_date, due_date)
 * @returns {Array} Mảng chứa các lỗi tìm thấy (nếu mảng rỗng thì dữ liệu hoàn toàn hợp lệ)
 */
function kiemTraDuLieuCongViec(duLieu) {
  const danhSachLoi = [];

  // Ràng buộc: Tiêu đề không được để trống
  if (!duLieu.title || typeof duLieu.title !== "string" || !duLieu.title.trim()) {
    danhSachLoi.push("Tên công việc không được để trống.");
  }

  // Ràng buộc: Kiểm tra tính hợp lệ của enum Status
  const trangThaiHopLe = ["pending", "in_progress", "completed", "overdue"];
  if (duLieu.status && !trangThaiHopLe.includes(duLieu.status)) {
    danhSachLoi.push("Trạng thái không hợp lệ.");
  }

  // Ràng buộc: Kiểm tra tính hợp lệ của enum Priority
  const mucUuTienHopLe = ["low", "medium", "high"];
  if (duLieu.priority && !mucUuTienHopLe.includes(duLieu.priority)) {
    danhSachLoi.push("Mức ưu tiên không hợp lệ.");
  }

  // Ràng buộc thời gian: Ngày đến hạn không được nhỏ hơn ngày bắt đầu
  if (duLieu.start_date && duLieu.due_date) {
    if (new Date(duLieu.due_date) < new Date(duLieu.start_date)) {
      danhSachLoi.push("Hạn hoàn thành không được nhỏ hơn ngày bắt đầu.");
    }
  }

  return danhSachLoi;
}

/**
 * Lấy toàn bộ danh sách công việc của người dùng
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>}
 */
async function layCongViecTheoNguoiDung(maNguoiDung) {
  return await congViecModel.layCongViecTheoNguoiDung(maNguoiDung);
}

/**
 * Lấy chi tiết công việc qua ID
 * 
 * @param {number} maCongViec - ID công việc
 * @throws {Error} Nếu không tìm thấy trả về 404
 * @returns {Promise<Object>}
 */
async function layCongViecTheoId(maCongViec) {
  const congViec = await congViecModel.layCongViecTheoId(maCongViec);
  if (!congViec) {
    throw taoLoi("Không tìm thấy công việc.", 404);
  }
  return congViec;
}

/**
 * Tạo công việc mới sau khi kiểm tra ràng buộc dữ liệu thành công
 * 
 * @param {number} maNguoiDung - ID người dùng tạo công việc
 * @param {Object} duLieuCongViec - Dữ liệu
 * @throws {Error} Quăng lỗi 400 nếu dữ liệu không hợp lệ
 * @returns {Promise<Object>}
 */
async function taoCongViec(maNguoiDung, duLieuCongViec) {
  const danhSachLoi = kiemTraDuLieuCongViec(duLieuCongViec);
  if (danhSachLoi.length) {
    throw taoLoi(danhSachLoi.join(" "), 400);
  }

  return await congViecModel.taoCongViec({
    user_id: maNguoiDung,
    category_id: duLieuCongViec.category_id || null,
    title: duLieuCongViec.title.trim(),
    description: (duLieuCongViec.description || "").trim(),
    start_date: duLieuCongViec.start_date || null,
    due_date: duLieuCongViec.due_date || null,
    priority: duLieuCongViec.priority || "medium",
    status: duLieuCongViec.status || "pending",
  });
}

/**
 * Cập nhật thông tin công việc, thực hiện kiểm tra quyền trước khi sửa đổi
 * 
 * @param {number} maCongViec - ID công việc
 * @param {number} maNguoiDung - ID người dùng thực hiện cập nhật
 * @param {Object} duLieuCongViec - Dữ liệu cập nhật
 * @returns {Promise<Object>}
 */
async function capNhatCongViec(maCongViec, maNguoiDung, duLieuCongViec) {
  const danhSachLoi = kiemTraDuLieuCongViec(duLieuCongViec);
  if (danhSachLoi.length) {
    throw taoLoi(danhSachLoi.join(" "), 400);
  }

  // Kiểm tra tồn tại
  const congViecCu = await congViecModel.layCongViecTheoId(maCongViec);
  if (!congViecCu) {
    throw taoLoi("Không tìm thấy công việc để sửa.", 404);
  }

  // Kiểm tra quyền sở hữu
  if (congViecCu.user_id !== maNguoiDung) {
    throw taoLoi("Bạn không có quyền sửa công việc này.", 403);
  }

  // Tự động lưu hoặc huỷ thời điểm hoàn thành tuỳ thuộc vào trạng thái
  let thoiDiemHoanThanh = congViecCu.completed_at;
  if (duLieuCongViec.status === "completed" && congViecCu.status !== "completed") {
    thoiDiemHoanThanh = new Date().toISOString(); // Đánh dấu mốc thời gian hoàn thành
  } else if (duLieuCongViec.status !== "completed") {
    thoiDiemHoanThanh = null; // Trả lại rỗng nếu thay đổi trạng thái khác
  }

  return await congViecModel.capNhatCongViec(maCongViec, {
    category_id: duLieuCongViec.category_id || null,
    title: duLieuCongViec.title.trim(),
    description: (duLieuCongViec.description || "").trim(),
    start_date: duLieuCongViec.start_date || null,
    due_date: duLieuCongViec.due_date || null,
    priority: duLieuCongViec.priority || "medium",
    status: duLieuCongViec.status || "pending",
    completed_at: thoiDiemHoanThanh,
  });
}

/**
 * Tính năng thay đổi trạng thái nhanh cho công việc
 * 
 * @param {number} maCongViec - ID công việc
 * @param {number} maNguoiDung - ID người dùng
 * @param {string} trangThai - Trạng thái mới
 * @returns {Promise<Object>}
 */
async function capNhatTrangThaiCongViec(maCongViec, maNguoiDung, trangThai) {
  const trangThaiHopLe = ["pending", "in_progress", "completed", "overdue"];
  if (!trangThaiHopLe.includes(trangThai)) {
    throw taoLoi("Trạng thái không hợp lệ.", 400);
  }

  const congViec = await congViecModel.layCongViecTheoId(maCongViec);
  if (!congViec) {
    throw taoLoi("Không tìm thấy công việc.", 404);
  }

  // Kiểm tra quyền sở hữu bảo mật
  if (congViec.user_id !== maNguoiDung) {
    throw taoLoi("Bạn không có quyền cập nhật công việc này.", 403);
  }

  // Nếu đã hoàn thành thì lưu kèm timestamp hiện tại
  const thoiDiemHoanThanh = trangThai === "completed" ? new Date().toISOString() : null;
  return await congViecModel.capNhatTrangThaiCongViec(maCongViec, trangThai, thoiDiemHoanThanh);
}

/**
 * Xoá công việc và kiểm tra phân quyền
 * 
 * @param {number} maCongViec - ID công việc cần xoá
 * @param {number} maNguoiDung - ID người thực thi
 * @returns {Promise<Object>} Thông tin công việc bị xoá
 */
async function xoaCongViec(maCongViec, maNguoiDung) {
  const congViec = await congViecModel.layCongViecTheoId(maCongViec);
  if (!congViec) {
    throw taoLoi("Không tìm thấy công việc để xoá.", 404);
  }

  if (congViec.user_id !== maNguoiDung) {
    throw taoLoi("Bạn không có quyền xoá công việc này.", 403);
  }

  await congViecModel.xoaCongViec(maCongViec);
  return congViec;
}

/**
 * Lọc và tìm kiếm danh sách công việc
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @param {Object} boLoc - Tham số tìm kiếm (từ khoá, danh mục, trạng thái...)
 * @returns {Promise<Array>}
 */
async function timKiemCongViec(maNguoiDung, boLoc) {
  return await congViecModel.timKiemCongViec(maNguoiDung, boLoc);
}

/**
 * Gộp thống kê (trạng thái, tổng số) của công việc
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Object>}
 */
async function layThongKeCongViec(maNguoiDung) {
  return await congViecModel.layThongKeCongViec(maNguoiDung);
}

/**
 * Hệ thống tự động đánh dấu các công việc đang chạy/chờ xử lý thành quá hạn
 * (Được kích hoạt bởi cron)
 * 
 * @returns {Promise<Array>}
 */
async function danhDauCongViecQuaHan() {
  return await congViecModel.danhDauCongViecQuaHan();
}

module.exports = {
  layCongViecTheoNguoiDung,
  layCongViecTheoId,
  taoCongViec,
  capNhatCongViec,
  capNhatTrangThaiCongViec,
  xoaCongViec,
  timKiemCongViec,
  layThongKeCongViec,
  danhDauCongViecQuaHan,
};