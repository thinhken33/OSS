const congViecService = require("../services/congViecService");

/**
 * Lấy danh sách toàn bộ công việc của một người dùng
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function layCongViec(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const danhSachCongViec = await congViecService.layCongViecTheoNguoiDung(maNguoiDung);
    res.json(danhSachCongViec);
  } catch (loi) {
    res.status(500).json({ message: loi.message || "Không lấy được danh sách công việc." });
  }
}

/**
 * Lấy thông tin chi tiết một công việc theo ID
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function layCongViecTheoId(req, res) {
  try {
    const congViec = await congViecService.layCongViecTheoId(parseInt(req.params.id));
    res.json(congViec);
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Thêm một công việc mới
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function taoCongViec(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const congViec = await congViecService.taoCongViec(maNguoiDung, req.body);
    res.status(201).json({
      message: "Tạo công việc thành công.",
      congViec,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Cập nhật toàn bộ thông tin của một công việc (tiêu đề, hạn chót, danh mục...)
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function capNhatCongViec(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const congViec = await congViecService.capNhatCongViec(parseInt(req.params.id), maNguoiDung, req.body);
    res.json({
      message: "Cập nhật công việc thành công.",
      congViec,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Chỉ cập nhật riêng trạng thái của công việc (ví dụ chuyển sang 'completed')
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function capNhatTrangThaiCongViec(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const { status } = req.body;
    const congViec = await congViecService.capNhatTrangThaiCongViec(parseInt(req.params.id), maNguoiDung, status);
    res.json({
      message: "Cập nhật trạng thái thành công.",
      congViec,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Xoá một công việc
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function xoaCongViec(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const congViec = await congViecService.xoaCongViec(parseInt(req.params.id), maNguoiDung);
    res.json({
      message: "Đã xoá công việc.",
      congViec,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Tìm kiếm và lọc danh sách công việc theo nhiều tiêu chí
 * 
 * @param {Object} req - Đối tượng HTTP Request (chứa các filter trong req.query)
 * @param {Object} res - Đối tượng HTTP Response
 */
async function timKiemCongViec(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const boLoc = {
      tuKhoa: req.query.keyword || null,
      trangThai: req.query.status || null,
      mucUuTien: req.query.priority || null,
      maDanhMuc: req.query.category_id ? parseInt(req.query.category_id) : null,
      hanHoanThanh: req.query.due_date || null,
    };
    const danhSachCongViec = await congViecService.timKiemCongViec(maNguoiDung, boLoc);
    res.json(danhSachCongViec);
  } catch (loi) {
    res.status(500).json({ message: loi.message || "Không tìm kiếm được." });
  }
}

/**
 * Thống kê tình trạng các công việc (số lượng hoàn thành, đang làm, quá hạn...)
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function layThongKeCongViec(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const thongKe = await congViecService.layThongKeCongViec(maNguoiDung);
    res.json(thongKe);
  } catch (loi) {
    res.status(500).json({ message: loi.message || "Không lấy được thống kê." });
  }
}

module.exports = {
  layCongViec,
  layCongViecTheoId,
  taoCongViec,
  capNhatCongViec,
  capNhatTrangThaiCongViec,
  xoaCongViec,
  timKiemCongViec,
  layThongKeCongViec,
};