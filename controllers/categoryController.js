const danhMucService = require("../services/categoryService");

/**
 * Lay tat ca danh muc cua nguoi dung
 */
async function layDanhMuc(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const danhSachDanhMuc = await danhMucService.layDanhMucTheoNguoiDung(maNguoiDung);
    phanHoi.json(danhSachDanhMuc);
  } catch (loi) {
    phanHoi.status(500).json({ message: loi.message || "Khong lay duoc danh muc." });
  }
}

/**
 * Lay danh muc theo ID
 */
async function layDanhMucTheoId(yeuCau, phanHoi) {
  try {
    const danhMuc = await danhMucService.layDanhMucTheoId(parseInt(yeuCau.params.id));
    phanHoi.json(danhMuc);
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Tao danh muc moi
 */
async function taoDanhMuc(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const danhMuc = await danhMucService.taoDanhMuc(maNguoiDung, yeuCau.body);
    phanHoi.status(201).json({
      message: "Tao danh muc thanh cong.",
      danhMuc,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Cap nhat danh muc
 */
async function capNhatDanhMuc(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const danhMuc = await danhMucService.capNhatDanhMuc(parseInt(yeuCau.params.id), maNguoiDung, yeuCau.body);
    phanHoi.json({
      message: "Cap nhat danh muc thanh cong.",
      danhMuc,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Xoa danh muc
 */
async function xoaDanhMuc(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const danhMuc = await danhMucService.xoaDanhMuc(parseInt(yeuCau.params.id), maNguoiDung);
    phanHoi.json({
      message: "Da xoa danh muc.",
      danhMuc,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

module.exports = {
  layDanhMuc,
  layDanhMucTheoId,
  taoDanhMuc,
  capNhatDanhMuc,
  xoaDanhMuc,
};
