const danhMucModel = require("../models/danhMucModel");

/**
 * Tiện ích: Tạo đối tượng lỗi (Error) kèm theo HTTP status code
 * 
 * @param {string} thongBao - Nội dung mô tả lỗi
 * @param {number} maLoi - Mã trạng thái HTTP (ví dụ: 400, 404, 403...)
 * @returns {Error} Đối tượng Error tuỳ chỉnh
 */
function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}

/**
 * Lấy danh sách danh mục theo ID người dùng
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>}
 */
async function layDanhMucTheoNguoiDung(maNguoiDung) {
  return await danhMucModel.layDanhMucTheoNguoiDung(maNguoiDung);
}

/**
 * Lấy danh mục dựa theo ID
 * 
 * @param {number} maDanhMuc - ID danh mục
 * @throws {Error} Quăng lỗi 404 nếu không tìm thấy
 * @returns {Promise<Object>}
 */
async function layDanhMucTheoId(maDanhMuc) {
  const danhMuc = await danhMucModel.layDanhMucTheoId(maDanhMuc);
  if (!danhMuc) {
    throw taoLoi("Không tìm thấy danh mục.", 404);
  }
  return danhMuc;
}

/**
 * Xử lý nghiệp vụ tạo danh mục mới
 * Đảm bảo tên danh mục hợp lệ và không bị trùng lặp với danh mục đã có
 * 
 * @param {number} maNguoiDung - ID người dùng tạo danh mục
 * @param {Object} duLieu - Chứa trường name
 * @throws {Error} Quăng lỗi 400 nếu dữ liệu trống, 409 nếu trùng tên
 * @returns {Promise<Object>}
 */
async function taoDanhMuc(maNguoiDung, { name }) {
  // Kiểm tra tính hợp lệ của dữ liệu đầu vào
  if (!name || !name.trim()) {
    throw taoLoi("Tên danh mục không được để trống.", 400);
  }

  // Kiểm tra tính duy nhất của tên danh mục
  const danhMucTonTai = await danhMucModel.layDanhMucTheoTen(maNguoiDung, name.trim());
  if (danhMucTonTai) {
    throw taoLoi("Tên danh mục đã tồn tại.", 409);
  }

  // Gọi Model tạo danh mục vào DB
  return await danhMucModel.taoDanhMuc({
    user_id: maNguoiDung,
    name: name.trim(),
  });
}

/**
 * Xử lý nghiệp vụ cập nhật thông tin danh mục
 * Kiểm tra quyền sở hữu, tính hợp lệ và không cho phép trùng tên với danh mục khác
 * 
 * @param {number} maDanhMuc - ID danh mục cần sửa
 * @param {number} maNguoiDung - ID người dùng yêu cầu sửa (để xác thực quyền)
 * @param {Object} duLieu - Dữ liệu mới cần sửa
 * @returns {Promise<Object>}
 */
async function capNhatDanhMuc(maDanhMuc, maNguoiDung, { name }) {
  if (!name || !name.trim()) {
    throw taoLoi("Tên danh mục không được để trống.", 400);
  }

  // Lấy danh mục gốc từ DB để kiểm tra
  const danhMuc = await danhMucModel.layDanhMucTheoId(maDanhMuc);
  if (!danhMuc) {
    throw taoLoi("Không tìm thấy danh mục để sửa.", 404);
  }

  // Kiểm tra quyền sở hữu (ngăn user này sửa danh mục của user khác)
  if (danhMuc.user_id !== maNguoiDung) {
    throw taoLoi("Bạn không có quyền sửa danh mục này.", 403);
  }

  // Kiểm tra xem tên mới có trùng với danh mục CÁC của người dùng đó không
  const danhMucTonTai = await danhMucModel.layDanhMucTheoTen(maNguoiDung, name.trim());
  if (danhMucTonTai && danhMucTonTai.category_id !== maDanhMuc) {
    throw taoLoi("Tên danh mục đã tồn tại.", 409);
  }

  return await danhMucModel.capNhatDanhMuc(maDanhMuc, { name: name.trim() });
}

/**
 * Nghiệp vụ xoá danh mục
 * Kiểm tra sự tồn tại và quyền sở hữu trước khi xoá
 * 
 * @param {number} maDanhMuc - ID danh mục
 * @param {number} maNguoiDung - ID người dùng yêu cầu xoá
 * @returns {Promise<Object>} Trả lại thông tin danh mục bị xoá
 */
async function xoaDanhMuc(maDanhMuc, maNguoiDung) {
  const danhMuc = await danhMucModel.layDanhMucTheoId(maDanhMuc);
  if (!danhMuc) {
    throw taoLoi("Không tìm thấy danh mục để xoá.", 404);
  }

  // Kiểm tra quyền bảo mật
  if (danhMuc.user_id !== maNguoiDung) {
    throw taoLoi("Bạn không có quyền xoá danh mục này.", 403);
  }

  await danhMucModel.xoaDanhMuc(maDanhMuc);
  return danhMuc;
}

module.exports = {
  layDanhMucTheoNguoiDung,
  layDanhMucTheoId,
  taoDanhMuc,
  capNhatDanhMuc,
  xoaDanhMuc,
};
