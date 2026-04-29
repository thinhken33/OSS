const danhMucService = require("../services/danhMucService");

/**
 * Lấy danh sách tất cả danh mục của một người dùng
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function layDanhMuc(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const danhSachDanhMuc = await danhMucService.layDanhMucTheoNguoiDung(maNguoiDung);
    res.json(danhSachDanhMuc);
  } catch (loi) {
    res.status(500).json({ message: loi.message || "Không lấy được danh mục." });
  }
}

/**
 * Lấy thông tin chi tiết một danh mục theo ID
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function layDanhMucTheoId(req, res) {
  try {
    const danhMuc = await danhMucService.layDanhMucTheoId(parseInt(req.params.id));
    res.json(danhMuc);
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Tạo một danh mục mới cho người dùng
 * 
 * @param {Object} req - Đối tượng HTTP Request, chứa thông tin danh mục trong body
 * @param {Object} res - Đối tượng HTTP Response
 */
async function taoDanhMuc(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const danhMuc = await danhMucService.taoDanhMuc(maNguoiDung, req.body);
    res.status(201).json({
      message: "Tạo danh mục thành công.",
      danhMuc,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Cập nhật tên hoặc thông tin của một danh mục
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function capNhatDanhMuc(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const danhMuc = await danhMucService.capNhatDanhMuc(parseInt(req.params.id), maNguoiDung, req.body);
    res.json({
      message: "Cập nhật danh mục thành công.",
      danhMuc,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Xoá một danh mục khỏi hệ thống
 * 
 * @param {Object} req - Đối tượng HTTP Request
 * @param {Object} res - Đối tượng HTTP Response
 */
async function xoaDanhMuc(req, res) {
  try {
    const maNguoiDung = parseInt(req.params.userId);
    const danhMuc = await danhMucService.xoaDanhMuc(parseInt(req.params.id), maNguoiDung);
    res.json({
      message: "Đã xoá danh mục.",
      danhMuc,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    res.status(maLoi).json({ message: loi.message });
  }
}

module.exports = {
  layDanhMuc,
  layDanhMucTheoId,
  taoDanhMuc,
  capNhatDanhMuc,
  xoaDanhMuc,
};
