const thongBaoService = require("../services/thongBaoService");

/**
 * Lấy toàn bộ danh sách thông báo của người dùng
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function layThongBao(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const danhSachThongBao = await thongBaoService.layThongBaoTheoNguoiDung(maNguoiDung);
    res.json(danhSachThongBao);
  } catch (loi) {
    res.status(500).json({ message: loi.message || "Không lấy được thông báo." });
  }
}

/**
 * Chỉ lấy danh sách thông báo chưa đọc
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function layThongBaoChuaDoc(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const danhSachThongBao = await thongBaoService.layThongBaoChuaDoc(maNguoiDung);
    res.json(danhSachThongBao);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
}

/**
 * Lấy số lượng thông báo chưa đọc để hiển thị badge
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function demChuaDoc(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const soLuong = await thongBaoService.demThongBaoChuaDoc(maNguoiDung);
    res.json({ soLuong });
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
}

/**
 * Tạo một thông báo mới
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function taoThongBao(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const thongBaoMoi = await thongBaoService.taoThongBao({
      user_id: maNguoiDung,
      task_id: req.body.task_id,
      message: req.body.message,
    });
    res.status(201).json({
      message: "Tạo thông báo thành công.",
      thongBao: thongBaoMoi,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Đánh dấu một thông báo cụ thể là "đã đọc"
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function danhDauDaDoc(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const thongBao = await thongBaoService.danhDauDaDoc(parseInt(req.params.id), maNguoiDung);
    res.json({
      message: "Đã đánh dấu đã đọc.",
      thongBao,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Đánh dấu tất cả thông báo của người dùng là "đã đọc"
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function danhDauTatCaDaDoc(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const danhSachThongBao = await thongBaoService.danhDauTatCaDaDoc(maNguoiDung);
    res.json({
      message: "Đã đánh dấu tất cả là đã đọc.",
      soLuong: danhSachThongBao.length,
    });
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
}

/**
 * Xoá một thông báo khỏi danh sách
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function xoaThongBao(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const thongBao = await thongBaoService.xoaThongBao(parseInt(req.params.id), maNguoiDung);
    res.json({
      message: "Đã xoá thông báo.",
      thongBao,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Tự động tạo các thông báo nhắc việc cho những công việc sắp đến hạn hoặc đã quá hạn
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function taoNhacViec(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const danhSachThongBao = await thongBaoService.taoThongBaoNhacViec(maNguoiDung);
    res.json({
      message: `Đã tạo ${danhSachThongBao.length} thông báo nhắc việc.`,
      danhSachThongBao,
    });
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
}

module.exports = {
  layThongBao,
  layThongBaoChuaDoc,
  demChuaDoc,
  taoThongBao,
  danhDauDaDoc,
  danhDauTatCaDaDoc,
  xoaThongBao,
  taoNhacViec,
};
