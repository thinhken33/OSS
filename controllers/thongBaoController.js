const thongBaoService = require("../services/thongBaoService");

/**
 * Lay tat ca thong bao cua nguoi dung
 */
async function layThongBao(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const danhSachThongBao = await thongBaoService.layThongBaoTheoNguoiDung(maNguoiDung);
    phanHoi.json(danhSachThongBao);
  } catch (loi) {
    phanHoi.status(500).json({ message: loi.message || "Khong lay duoc thong bao." });
  }
}

/**
 * Lay thong bao chua doc
 */
async function layThongBaoChuaDoc(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const danhSachThongBao = await thongBaoService.layThongBaoChuaDoc(maNguoiDung);
    phanHoi.json(danhSachThongBao);
  } catch (loi) {
    phanHoi.status(500).json({ message: loi.message });
  }
}

/**
 * Dem thong bao chua doc
 */
async function demChuaDoc(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const soLuong = await thongBaoService.demThongBaoChuaDoc(maNguoiDung);
    phanHoi.json({ soLuong });
  } catch (loi) {
    phanHoi.status(500).json({ message: loi.message });
  }
}

/**
 * Tao thong bao moi
 */
async function taoThongBao(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const thongBaoMoi = await thongBaoService.taoThongBao({
      user_id: maNguoiDung,
      task_id: yeuCau.body.task_id,
      message: yeuCau.body.message,
    });
    phanHoi.status(201).json({
      message: "Tao thong bao thanh cong.",
      thongBao: thongBaoMoi,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Danh dau da doc mot thong bao
 */
async function danhDauDaDoc(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const thongBao = await thongBaoService.danhDauDaDoc(parseInt(yeuCau.params.id), maNguoiDung);
    phanHoi.json({
      message: "Da danh dau da doc.",
      thongBao,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Danh dau tat ca da doc
 */
async function danhDauTatCaDaDoc(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const danhSachThongBao = await thongBaoService.danhDauTatCaDaDoc(maNguoiDung);
    phanHoi.json({
      message: "Da danh dau tat ca la da doc.",
      soLuong: danhSachThongBao.length,
    });
  } catch (loi) {
    phanHoi.status(500).json({ message: loi.message });
  }
}

/**
 * Xoa thong bao
 */
async function xoaThongBao(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const thongBao = await thongBaoService.xoaThongBao(parseInt(yeuCau.params.id), maNguoiDung);
    phanHoi.json({
      message: "Da xoa thong bao.",
      thongBao,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Tao thong bao nhac viec tu dong
 */
async function taoNhacViec(yeuCau, phanHoi) {
  try {
    const maNguoiDung = parseInt(yeuCau.params.userId);
    const danhSachThongBao = await thongBaoService.taoThongBaoNhacViec(maNguoiDung);
    phanHoi.json({
      message: `Da tao ${danhSachThongBao.length} thong bao nhac viec.`,
      danhSachThongBao,
    });
  } catch (loi) {
    phanHoi.status(500).json({ message: loi.message });
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
