const nguoiDungModel = require("../models/nguoiDungModel");
const bcrypt = require("bcryptjs");

const SO_VONG_MA_HOA = 10;

/**
 * Tiện ích: Tạo đối tượng lỗi kèm HTTP code
 * 
 * @param {string} thongBao - Nội dung lỗi
 * @param {number} maLoi - Mã trạng thái HTTP
 * @returns {Error}
 */
function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}

/**
 * Lấy danh sách toàn bộ người dùng
 * @returns {Promise<Array>}
 */
async function layTatCaNguoiDung() {
  return await nguoiDungModel.layTatCaNguoiDung();
}

/**
 * Lấy chi tiết thông tin người dùng dựa theo ID
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @throws {Error} Nếu không tìm thấy
 * @returns {Promise<Object>}
 */
async function layNguoiDungTheoId(maNguoiDung) {
  const nguoiDung = await nguoiDungModel.layNguoiDungTheoId(maNguoiDung);
  if (!nguoiDung) {
    throw taoLoi("Không tìm thấy người dùng.", 404);
  }
  return nguoiDung;
}

/**
 * Nghiệp vụ đăng ký tài khoản:
 * Kiểm tra các ràng buộc, băm mật khẩu và lưu vào DB
 * 
 * @param {Object} duLieu - Thông tin từ req.body
 * @throws {Error} Lỗi liên quan đến format (400) hoặc trùng lặp (409)
 * @returns {Promise<Object>} Thông tin user sau khi tạo
 */
async function dangKyNguoiDung({ full_name, email, password, avatar_url, bio }) {
  const danhSachLoi = [];

  // Xác thực họ tên
  if (!full_name || !full_name.trim()) {
    danhSachLoi.push("Họ và tên không được để trống.");
  }

  // Xác thực email hợp lệ (Regex cơ bản)
  if (!email || !email.trim()) {
    danhSachLoi.push("Email không được để trống.");
  } else {
    const bieuThucEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!bieuThucEmail.test(email)) {
      danhSachLoi.push("Email không đúng định dạng.");
    }
  }

  // Xác thực độ mạnh mật khẩu (ít nhất 6 ký tự)
  if (!password || password.length < 6) {
    danhSachLoi.push("Mật khẩu phải có ít nhất 6 ký tự.");
  }

  if (danhSachLoi.length) {
    throw taoLoi(danhSachLoi.join(" "), 400);
  }

  // Ràng buộc: Email không được trùng lặp trong hệ thống
  const nguoiDungTonTai = await nguoiDungModel.layNguoiDungTheoEmail(email.trim());
  if (nguoiDungTonTai) {
    throw taoLoi("Email đã được sử dụng.", 409);
  }

  // Thực hiện mã hoá (Hash) mật khẩu bằng thư viện bcrypt
  const matKhauHash = await bcrypt.hash(password, SO_VONG_MA_HOA);

  // Tạo người dùng mới qua Model
  const nguoiDungMoi = await nguoiDungModel.taoNguoiDung({
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    password_hash: matKhauHash,
    avatar_url: avatar_url || null,
    bio: bio || null,
  });

  return nguoiDungMoi;
}

/**
 * Xử lý đăng nhập: Kiểm tra xem tài khoản/mật khẩu có đúng không
 * 
 * @param {Object} thongTin - Gồm email, password
 * @throws {Error} 401 nếu sai, 403 nếu tài khoản bị admin khoá
 * @returns {Promise<Object>} Thông tin người dùng an toàn (không có password_hash)
 */
async function dangNhap({ email, password }) {
  if (!email || !password) {
    throw taoLoi("Email và mật khẩu không được để trống.", 400);
  }

  const nguoiDung = await nguoiDungModel.layNguoiDungTheoEmail(email.trim().toLowerCase());

  if (!nguoiDung) {
    throw taoLoi("Email hoặc mật khẩu không đúng.", 401);
  }

  // Kiểm tra trạng thái khoá tài khoản
  if (nguoiDung.is_locked) {
    throw taoLoi("Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên.", 403);
  }

  // So khớp mật khẩu người dùng nhập và hash trong CSDL
  const matKhauKhop = await bcrypt.compare(password, nguoiDung.password_hash);
  if (!matKhauKhop) {
    throw taoLoi("Email hoặc mật khẩu không đúng.", 401);
  }

  // Chỉ lấy ra các trường an toàn để trả về client (loại bỏ password_hash)
  const { password_hash, ...nguoiDungKhongMatKhau } = nguoiDung;
  return nguoiDungKhongMatKhau;
}

/**
 * Cập nhật thông tin cá nhân (họ tên, ảnh, bio)
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @param {Object} duLieu - Thông tin mới
 * @returns {Promise<Object>}
 */
async function capNhatNguoiDung(maNguoiDung, { full_name, avatar_url, bio }) {
  if (!full_name || !full_name.trim()) {
    throw taoLoi("Họ và tên không được để trống.", 400);
  }

  const nguoiDung = await nguoiDungModel.capNhatNguoiDung(maNguoiDung, {
    full_name: full_name.trim(),
    avatar_url,
    bio,
  });

  if (!nguoiDung) {
    throw taoLoi("Không tìm thấy người dùng để cập nhật.", 404);
  }

  return nguoiDung;
}

/**
 * Xử lý đổi mật khẩu
 * Phải xác minh mật khẩu cũ chính xác mới cho đổi sang mật khẩu mới
 * 
 * @param {number} maNguoiDung - ID người dùng đổi
 * @param {Object} duLieu - Chứa current_password, new_password
 * @returns {Promise<Object>} Message thành công
 */
async function doiMatKhau(maNguoiDung, { current_password, new_password }) {
  if (!current_password || !new_password) {
    throw taoLoi("Mật khẩu hiện tại và mật khẩu mới không được để trống.", 400);
  }

  if (new_password.length < 6) {
    throw taoLoi("Mật khẩu mới phải có ít nhất 6 ký tự.", 400);
  }

  const nguoiDung = await nguoiDungModel.layNguoiDungTheoId(maNguoiDung);
  if (!nguoiDung) {
    throw taoLoi("Không tìm thấy người dùng.", 404);
  }

  // Lấy password_hash qua layNguoiDungTheoEmail để so sánh
  const nguoiDungDayDu = await nguoiDungModel.layNguoiDungTheoEmail(nguoiDung.email);
  const matKhauKhop = await bcrypt.compare(current_password, nguoiDungDayDu.password_hash);
  if (!matKhauKhop) {
    throw taoLoi("Mật khẩu hiện tại không đúng.", 401);
  }

  // Băm mật khẩu mới và lưu
  const matKhauHash = await bcrypt.hash(new_password, SO_VONG_MA_HOA);
  await nguoiDungModel.capNhatMatKhau(maNguoiDung, matKhauHash);

  return { message: "Đổi mật khẩu thành công." };
}

/**
 * Thay đổi trạng thái khoá tài khoản (dành cho tính năng Admin)
 * 
 * @param {number} maNguoiDung - ID của user bị khoá/mở
 * @param {boolean} daKhoa - true/false
 * @returns {Promise<Object>}
 */
async function datTrangThaiKhoa(maNguoiDung, daKhoa) {
  const nguoiDung = await nguoiDungModel.datTrangThaiKhoa(maNguoiDung, daKhoa);
  if (!nguoiDung) {
    throw taoLoi("Không tìm thấy người dùng.", 404);
  }
  return nguoiDung;
}

/**
 * Xoá người dùng vĩnh viễn
 * 
 * @param {number} maNguoiDung - ID user
 * @returns {Promise<Object>} Dữ liệu user vừa xoá
 */
async function xoaNguoiDung(maNguoiDung) {
  const nguoiDung = await nguoiDungModel.layNguoiDungTheoId(maNguoiDung);
  if (!nguoiDung) {
    throw taoLoi("Không tìm thấy người dùng để xoá.", 404);
  }

  await nguoiDungModel.xoaNguoiDung(maNguoiDung);
  return nguoiDung;
}

module.exports = {
  layTatCaNguoiDung,
  layNguoiDungTheoId,
  dangKyNguoiDung,
  dangNhap,
  capNhatNguoiDung,
  doiMatKhau,
  datTrangThaiKhoa,
  xoaNguoiDung,
};
