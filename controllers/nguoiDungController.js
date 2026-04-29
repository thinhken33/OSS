const nguoiDungService = require("../services/nguoiDungService");

/**
 * Lấy danh sách tất cả người dùng
 * (Chỉ dành cho quyền Admin)
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function layTatCaNguoiDung(req, res) {
  try {
    const danhSachNguoiDung = await nguoiDungService.layTatCaNguoiDung();
    res.json(danhSachNguoiDung);
  } catch (loi) {
    res.status(500).json({ message: loi.message || "Không lấy được danh sách người dùng." });
  }
}

/**
 * Lấy thông tin người dùng theo ID
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function layNguoiDungTheoId(req, res) {
  try {
    const nguoiDung = await nguoiDungService.layNguoiDungTheoId(parseInt(req.params.id));
    res.json(nguoiDung);
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Xử lý đăng ký tài khoản mới
 * Kiểm tra các ràng buộc đầu vào và tạo người dùng mới trong DB
 * 
 * @param {Object} req - Đối tượng HTTP Request, chứa thông tin đăng ký trong req.body
 * @param {Object} res - Đối tượng HTTP Response
 */
async function dangKy(req, res) {
  try {
    const nguoiDung = await nguoiDungService.dangKyNguoiDung(req.body);
    res.status(201).json({
      message: "Đăng ký thành công.",
      nguoiDung,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Xử lý đăng nhập
 * Kiểm tra email, mật khẩu và trả về thông tin user
 * 
 * @param {Object} req - Đối tượng HTTP Request, chứa email, password trong req.body
 * @param {Object} res - Đối tượng HTTP Response
 */
async function dangNhap(req, res) {
  try {
    const nguoiDung = await nguoiDungService.dangNhap(req.body);
    res.json({
      message: "Đăng nhập thành công.",
      nguoiDung,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Cập nhật thông tin cá nhân của người dùng (họ tên, ảnh đại diện, tiểu sử...)
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function capNhatNguoiDung(req, res) {
  try {
    const nguoiDung = await nguoiDungService.capNhatNguoiDung(parseInt(req.params.id), req.body);
    res.json({
      message: "Cập nhật thành công.",
      nguoiDung,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Đổi mật khẩu tài khoản
 * Yêu cầu cung cấp mật khẩu cũ để xác thực trước khi đổi sang mật khẩu mới
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function doiMatKhau(req, res) {
  try {
    const ketQua = await nguoiDungService.doiMatKhau(parseInt(req.params.id), req.body);
    res.json(ketQua);
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Khoá hoặc mở khoá tài khoản
 * (Chỉ dành cho quyền Admin)
 * 
 * @param {Object} req - Đối tượng HTTP Request, req.body.is_locked quy định trạng thái
 * @param {Object} res - Đối tượng HTTP Response
 */
async function datTrangThaiKhoa(req, res) {
  try {
    const { is_locked } = req.body;
    const nguoiDung = await nguoiDungService.datTrangThaiKhoa(parseInt(req.params.id), is_locked);
    res.json({
      message: is_locked ? "Đã khoá tài khoản." : "Đã mở khoá tài khoản.",
      nguoiDung,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Xoá vĩnh viễn tài khoản người dùng
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function xoaNguoiDung(req, res) {
  try {
    const nguoiDung = await nguoiDungService.xoaNguoiDung(parseInt(req.params.id));
    res.json({
      message: "Đã xoá người dùng.",
      nguoiDung,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

module.exports = {
  layTatCaNguoiDung,
  layNguoiDungTheoId,
  dangKy,
  dangNhap,
  capNhatNguoiDung,
  doiMatKhau,
  datTrangThaiKhoa,
  xoaNguoiDung,
};
