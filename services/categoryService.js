const danhMucModel = require("../models/categoryModel");

function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}

/**
 * Lay tat ca danh muc cua nguoi dung
 */
async function layDanhMucTheoNguoiDung(maNguoiDung) {
  return await danhMucModel.layDanhMucTheoNguoiDung(maNguoiDung);
}

/**
 * Lay danh muc theo ID
 */
async function layDanhMucTheoId(maDanhMuc) {
  const danhMuc = await danhMucModel.layDanhMucTheoId(maDanhMuc);
  if (!danhMuc) {
    throw taoLoi("Khong tim thay danh muc.", 404);
  }
  return danhMuc;
}

/**
 * Tao danh muc moi
 */
async function taoDanhMuc(maNguoiDung, { name }) {
  // Kiem tra du lieu
  if (!name || !name.trim()) {
    throw taoLoi("Ten danh muc khong duoc de trong.", 400);
  }

  // Kiem tra trung ten
  const danhMucTonTai = await danhMucModel.layDanhMucTheoTen(maNguoiDung, name.trim());
  if (danhMucTonTai) {
    throw taoLoi("Ten danh muc da ton tai.", 409);
  }

  return await danhMucModel.taoDanhMuc({
    user_id: maNguoiDung,
    name: name.trim(),
  });
}

/**
 * Cap nhat danh muc
 */
async function capNhatDanhMuc(maDanhMuc, maNguoiDung, { name }) {
  if (!name || !name.trim()) {
    throw taoLoi("Ten danh muc khong duoc de trong.", 400);
  }

  // Kiem tra danh muc co ton tai
  const danhMuc = await danhMucModel.layDanhMucTheoId(maDanhMuc);
  if (!danhMuc) {
    throw taoLoi("Khong tim thay danh muc de sua.", 404);
  }

  // Kiem tra quyen so huu
  if (danhMuc.user_id !== maNguoiDung) {
    throw taoLoi("Ban khong co quyen sua danh muc nay.", 403);
  }

  // Kiem tra trung ten (tru chinh no)
  const danhMucTonTai = await danhMucModel.layDanhMucTheoTen(maNguoiDung, name.trim());
  if (danhMucTonTai && danhMucTonTai.category_id !== maDanhMuc) {
    throw taoLoi("Ten danh muc da ton tai.", 409);
  }

  return await danhMucModel.capNhatDanhMuc(maDanhMuc, { name: name.trim() });
}

/**
 * Xoa danh muc
 */
async function xoaDanhMuc(maDanhMuc, maNguoiDung) {
  const danhMuc = await danhMucModel.layDanhMucTheoId(maDanhMuc);
  if (!danhMuc) {
    throw taoLoi("Khong tim thay danh muc de xoa.", 404);
  }

  // Kiem tra quyen so huu
  if (danhMuc.user_id !== maNguoiDung) {
    throw taoLoi("Ban khong co quyen xoa danh muc nay.", 403);
  }

  await danhMucModel.xoaDanhMuc(maDanhMuc);
  return danhMuc;
}

module.exports = {
  layDanhMucTheoNguoiDung,
  layDanhMucTheoId,
  taoDanhMuc,
  capNhatDanhMuc,
  xoaDanhMuc,
};
