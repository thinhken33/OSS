const thongBaoModel = require("../models/thongBaoModel");
const congViecModel = require("../models/congViecModel");

/**
 * Tiện ích: Tạo đối tượng lỗi (Error) với HTTP Code
 * 
 * @param {string} thongBao - Nội dung mô tả lỗi
 * @param {number} maLoi - Mã trạng thái HTTP
 * @returns {Error}
 */
function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}

/**
 * Lấy danh sách toàn bộ thông báo (cả đọc và chưa đọc)
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>}
 */
async function layThongBaoTheoNguoiDung(maNguoiDung) {
  return await thongBaoModel.layThongBaoTheoNguoiDung(maNguoiDung);
}

/**
 * Lấy các thông báo chưa đọc
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>}
 */
async function layThongBaoChuaDoc(maNguoiDung) {
  return await thongBaoModel.layThongBaoChuaDoc(maNguoiDung);
}

/**
 * Đếm số thông báo chưa đọc để hiển thị số lượng (badge)
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<number>}
 */
async function demThongBaoChuaDoc(maNguoiDung) {
  return await thongBaoModel.demThongBaoChuaDoc(maNguoiDung);
}

/**
 * Tạo một thông báo mới
 * 
 * @param {Object} duLieu - Bao gồm user_id, task_id (có thể trống), message
 * @throws {Error} Nếu không có message
 * @returns {Promise<Object>}
 */
async function taoThongBao({ user_id, task_id, message }) {
  if (!message || !message.trim()) {
    throw taoLoi("Nội dung thông báo không được để trống.", 400);
  }

  return await thongBaoModel.taoThongBao({
    user_id,
    task_id: task_id || null,
    message: message.trim(),
  });
}

/**
 * Đánh dấu một thông báo là đã đọc
 * 
 * @param {number} maThongBao - ID thông báo
 * @param {number} maNguoiDung - ID người dùng sở hữu thông báo (dùng để xác thực quyền)
 * @throws {Error} 404 nếu không tìm thấy, 403 nếu cố đánh dấu thông báo của người khác
 * @returns {Promise<Object>}
 */
async function danhDauDaDoc(maThongBao, maNguoiDung) {
  const thongBaoHienTai = await thongBaoModel.layThongBaoTheoId(maThongBao);
  if (!thongBaoHienTai) {
    throw taoLoi("Không tìm thấy thông báo.", 404);
  }

  // Đảm bảo tính bảo mật (chỉ người chủ của thông báo mới được phép đánh dấu)
  if (thongBaoHienTai.user_id !== maNguoiDung) {
    throw taoLoi("Bạn không có quyền thao tác thông báo này.", 403);
  }

  return await thongBaoModel.danhDauDaDoc(maThongBao);
}

/**
 * Đánh dấu tất cả thông báo của user thành trạng thái "Đã đọc"
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>}
 */
async function danhDauTatCaDaDoc(maNguoiDung) {
  return await thongBaoModel.danhDauTatCaDaDoc(maNguoiDung);
}

/**
 * Xoá một thông báo cụ thể
 * 
 * @param {number} maThongBao - ID thông báo
 * @param {number} maNguoiDung - ID người dùng
 * @throws {Error} 404 hoặc 403
 * @returns {Promise<Object>} Thông báo vừa xoá
 */
async function xoaThongBao(maThongBao, maNguoiDung) {
  const thongBaoHienTai = await thongBaoModel.layThongBaoTheoId(maThongBao);
  if (!thongBaoHienTai) {
    throw taoLoi("Không tìm thấy thông báo để xoá.", 404);
  }

  if (thongBaoHienTai.user_id !== maNguoiDung) {
    throw taoLoi("Bạn không có quyền xoá thông báo này.", 403);
  }

  await thongBaoModel.xoaThongBao(maThongBao);
  return thongBaoHienTai;
}

/**
 * Tự động tạo thông báo nhắc nhở cho các công việc sắp tới hạn (trong vòng 1 ngày) hoặc đã quá hạn
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>} Danh sách các thông báo đã được tạo
 */
async function taoThongBaoNhacViec(maNguoiDung) {
  const danhSachCongViec = await congViecModel.layCongViecQuaHanVaSapDenHan(maNguoiDung);
  const danhSachThongBao = [];

  for (const congViec of danhSachCongViec) {
    const bayGio = new Date();
    const hanHoanThanh = new Date(congViec.due_date);
    let noiDung;

    // Phân loại nội dung thông báo dựa vào hạn của công việc
    if (hanHoanThanh < bayGio) {
      noiDung = `Công việc "${congViec.title}" đã quá hạn!`;
    } else {
      noiDung = `Công việc "${congViec.title}" sắp đến hạn (${hanHoanThanh.toLocaleDateString("vi-VN")}).`;
    }

    // Ghi vào CSDL
    const thongBaoMoi = await thongBaoModel.taoThongBao({
      user_id: maNguoiDung,
      task_id: congViec.task_id,
      message: noiDung,
    });
    danhSachThongBao.push(thongBaoMoi);
  }

  return danhSachThongBao;
}

module.exports = {
  layThongBaoTheoNguoiDung,
  layThongBaoChuaDoc,
  demThongBaoChuaDoc,
  taoThongBao,
  danhDauDaDoc,
  danhDauTatCaDaDoc,
  xoaThongBao,
  taoThongBaoNhacViec,
};
