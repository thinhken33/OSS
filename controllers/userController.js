const nguoiDungService = require("../services/userService");

/**
 * Lay danh sach tat ca nguoi dung (Admin)
 */
async function layTatCaNguoiDung(yeuCau, phanHoi) {
  try {
    const danhSachNguoiDung = await nguoiDungService.layTatCaNguoiDung();
    phanHoi.json(danhSachNguoiDung);
  } catch (loi) {
    phanHoi.status(500).json({ message: loi.message || "Khong lay duoc danh sach nguoi dung." });
  }
}

/**
 * Lay thong tin nguoi dung theo ID
 */
async function layNguoiDungTheoId(yeuCau, phanHoi) {
  try {
    const nguoiDung = await nguoiDungService.layNguoiDungTheoId(parseInt(yeuCau.params.id));
    phanHoi.json(nguoiDung);
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Dang ky tai khoan
 */
async function dangKy(yeuCau, phanHoi) {
  try {
    const nguoiDung = await nguoiDungService.dangKyNguoiDung(yeuCau.body);
    phanHoi.status(201).json({
      message: "Dang ky thanh cong.",
      nguoiDung,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Dang nhap
 */
async function dangNhap(yeuCau, phanHoi) {
  try {
    const nguoiDung = await nguoiDungService.dangNhap(yeuCau.body);
    phanHoi.json({
      message: "Dang nhap thanh cong.",
      nguoiDung,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Cap nhat thong tin ca nhan
 */
async function capNhatNguoiDung(yeuCau, phanHoi) {
  try {
    const nguoiDung = await nguoiDungService.capNhatNguoiDung(parseInt(yeuCau.params.id), yeuCau.body);
    phanHoi.json({
      message: "Cap nhat thanh cong.",
      nguoiDung,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Doi mat khau
 */
async function doiMatKhau(yeuCau, phanHoi) {
  try {
    const ketQua = await nguoiDungService.doiMatKhau(parseInt(yeuCau.params.id), yeuCau.body);
    phanHoi.json(ketQua);
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Khoa/mo khoa tai khoan (Admin)
 */
async function datTrangThaiKhoa(yeuCau, phanHoi) {
  try {
    const { is_locked } = yeuCau.body;
    const nguoiDung = await nguoiDungService.datTrangThaiKhoa(parseInt(yeuCau.params.id), is_locked);
    phanHoi.json({
      message: is_locked ? "Da khoa tai khoan." : "Da mo khoa tai khoan.",
      nguoiDung,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
  }
}

/**
 * Xoa nguoi dung
 */
async function xoaNguoiDung(yeuCau, phanHoi) {
  try {
    const nguoiDung = await nguoiDungService.xoaNguoiDung(parseInt(yeuCau.params.id));
    phanHoi.json({
      message: "Da xoa nguoi dung.",
      nguoiDung,
    });
  } catch (loi) {
    const maLoi = loi.statusCode || 500;
    phanHoi.status(maLoi).json({ message: loi.message });
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
