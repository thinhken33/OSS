const nguoiDungModel = require("../models/userModel");
const bcrypt = require("bcryptjs");

const SO_VONG_MA_HOA = 10;

function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}

/**
 * Lay danh sach tat ca nguoi dung
 */
async function layTatCaNguoiDung() {
  return await nguoiDungModel.layTatCaNguoiDung();
}

/**
 * Lay thong tin nguoi dung theo ID
 */
async function layNguoiDungTheoId(maNguoiDung) {
  const nguoiDung = await nguoiDungModel.layNguoiDungTheoId(maNguoiDung);
  if (!nguoiDung) {
    throw taoLoi("Khong tim thay nguoi dung.", 404);
  }
  return nguoiDung;
}

/**
 * Dang ky tai khoan moi
 */
async function dangKyNguoiDung({ full_name, email, password, avatar_url, bio }) {
  // Kiem tra du lieu dau vao
  const danhSachLoi = [];

  if (!full_name || !full_name.trim()) {
    danhSachLoi.push("Ho va ten khong duoc de trong.");
  }

  if (!email || !email.trim()) {
    danhSachLoi.push("Email khong duoc de trong.");
  } else {
    const bieuThucEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!bieuThucEmail.test(email)) {
      danhSachLoi.push("Email khong dung dinh dang.");
    }
  }

  if (!password || password.length < 6) {
    danhSachLoi.push("Mat khau phai co it nhat 6 ky tu.");
  }

  if (danhSachLoi.length) {
    throw taoLoi(danhSachLoi.join(" "), 400);
  }

  // Kiem tra email da ton tai
  const nguoiDungTonTai = await nguoiDungModel.layNguoiDungTheoEmail(email.trim());
  if (nguoiDungTonTai) {
    throw taoLoi("Email da duoc su dung.", 409);
  }

  // Ma hoa mat khau
  const matKhauHash = await bcrypt.hash(password, SO_VONG_MA_HOA);

  // Tao nguoi dung moi
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
 * Dang nhap
 */
async function dangNhap({ email, password }) {
  if (!email || !password) {
    throw taoLoi("Email va mat khau khong duoc de trong.", 400);
  }

  const nguoiDung = await nguoiDungModel.layNguoiDungTheoEmail(email.trim().toLowerCase());

  if (!nguoiDung) {
    throw taoLoi("Email hoac mat khau khong dung.", 401);
  }

  if (nguoiDung.is_locked) {
    throw taoLoi("Tai khoan da bi khoa. Vui long lien he quan tri vien.", 403);
  }

  const matKhauKhop = await bcrypt.compare(password, nguoiDung.password_hash);
  if (!matKhauKhop) {
    throw taoLoi("Email hoac mat khau khong dung.", 401);
  }

  // Tra ve nguoi dung khong co password_hash
  const { password_hash, ...nguoiDungKhongMatKhau } = nguoiDung;
  return nguoiDungKhongMatKhau;
}

/**
 * Cap nhat thong tin ca nhan
 */
async function capNhatNguoiDung(maNguoiDung, { full_name, avatar_url, bio }) {
  if (!full_name || !full_name.trim()) {
    throw taoLoi("Ho va ten khong duoc de trong.", 400);
  }

  const nguoiDung = await nguoiDungModel.capNhatNguoiDung(maNguoiDung, {
    full_name: full_name.trim(),
    avatar_url,
    bio,
  });

  if (!nguoiDung) {
    throw taoLoi("Khong tim thay nguoi dung de cap nhat.", 404);
  }

  return nguoiDung;
}

/**
 * Doi mat khau
 */
async function doiMatKhau(maNguoiDung, { current_password, new_password }) {
  if (!current_password || !new_password) {
    throw taoLoi("Mat khau hien tai va mat khau moi khong duoc de trong.", 400);
  }

  if (new_password.length < 6) {
    throw taoLoi("Mat khau moi phai co it nhat 6 ky tu.", 400);
  }

  // Lay nguoi dung co password_hash
  const nguoiDung = await nguoiDungModel.layNguoiDungTheoId(maNguoiDung);
  if (!nguoiDung) {
    throw taoLoi("Khong tim thay nguoi dung.", 404);
  }

  // Lay full nguoi dung (co password_hash) qua email
  const nguoiDungDayDu = await nguoiDungModel.layNguoiDungTheoEmail(nguoiDung.email);
  const matKhauKhop = await bcrypt.compare(current_password, nguoiDungDayDu.password_hash);
  if (!matKhauKhop) {
    throw taoLoi("Mat khau hien tai khong dung.", 401);
  }

  const matKhauHash = await bcrypt.hash(new_password, SO_VONG_MA_HOA);
  await nguoiDungModel.capNhatMatKhau(maNguoiDung, matKhauHash);

  return { message: "Doi mat khau thanh cong." };
}

/**
 * Khoa/mo khoa tai khoan (Admin)
 */
async function datTrangThaiKhoa(maNguoiDung, daKhoa) {
  const nguoiDung = await nguoiDungModel.datTrangThaiKhoa(maNguoiDung, daKhoa);
  if (!nguoiDung) {
    throw taoLoi("Khong tim thay nguoi dung.", 404);
  }
  return nguoiDung;
}

/**
 * Xoa nguoi dung
 */
async function xoaNguoiDung(maNguoiDung) {
  const nguoiDung = await nguoiDungModel.layNguoiDungTheoId(maNguoiDung);
  if (!nguoiDung) {
    throw taoLoi("Khong tim thay nguoi dung de xoa.", 404);
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
