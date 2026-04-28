const congViecService = require("../services/congViecService");

/**
 * Lay tat ca cong viec cua nguoi dung
 */
async function layCongViec(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const danhSachCongViec = await congViecService.layCongViecTheoNguoiDung(maNguoiDung);
    phanHoi.json(danhSachCongViec);
  } catch (loi) {
    phanHoi.status(500).json({ message: loi.message || "Khong lay duoc danh sach cong viec." });
  }
}

/**
 * Lay cong viec theo ID
 */
async function layCongViecTheoId(yeuCau, phanHoi) {
  try {
    const congViec = await congViecService.layCongViecTheoId(parseInt(yeuCau.params.id));
    phanHoi.json(congViec);
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Tao cong viec moi
 */
async function taoCongViec(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const congViec = await congViecService.taoCongViec(maNguoiDung, yeuCau.body);
    phanHoi.status(201).json({
      message: "Tao cong viec thanh cong.",
      congViec,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Cap nhat cong viec
 */
async function capNhatCongViec(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const congViec = await congViecService.capNhatCongViec(parseInt(yeuCau.params.id), maNguoiDung, yeuCau.body);
    phanHoi.json({
      message: "Cap nhat cong viec thanh cong.",
      congViec,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Cap nhat trang thai cong viec
 */
async function capNhatTrangThaiCongViec(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const { status } = yeuCau.body;
    const congViec = await congViecService.capNhatTrangThaiCongViec(parseInt(yeuCau.params.id), maNguoiDung, status);
    phanHoi.json({
      message: "Cap nhat trang thai thanh cong.",
      congViec,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Xoa cong viec
 */
async function xoaCongViec(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const congViec = await congViecService.xoaCongViec(parseInt(yeuCau.params.id), maNguoiDung);
    phanHoi.json({
      message: "Da xoa cong viec.",
      congViec,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Tim kiem va loc cong viec
 */
async function timKiemCongViec(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const boLoc = {
      tuKhoa: yeuCau.query.keyword || null,
      trangThai: yeuCau.query.status || null,
      mucUuTien: yeuCau.query.priority || null,
      maDanhMuc: yeuCau.query.category_id ? parseInt(yeuCau.query.category_id) : null,
      hanHoanThanh: yeuCau.query.due_date || null,
    };
    const danhSachCongViec = await congViecService.timKiemCongViec(maNguoiDung, boLoc);
    phanHoi.json(danhSachCongViec);
  } catch (loi) {
    phanHoi.status(500).json({ message: loi.message || "Khong tim kiem duoc." });
  }
}

/**
 * Lay thong ke cong viec
 */
async function layThongKeCongViec(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const thongKe = await congViecService.layThongKeCongViec(maNguoiDung);
    phanHoi.json(thongKe);
  } catch (loi) {
    phanHoi.status(500).json({ message: loi.message || "Khong lay duoc thong ke." });
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