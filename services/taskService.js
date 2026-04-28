const congViecModel = require("../models/taskModel");

function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}

/**
 * Kiem tra du lieu cong viec
 */
function kiemTraDuLieuCongViec(duLieu) {
  const danhSachLoi = [];

  if (!duLieu.title || typeof duLieu.title !== "string" || !duLieu.title.trim()) {
    danhSachLoi.push("Ten cong viec khong duoc de trong.");
  }

  const trangThaiHopLe = ["pending", "in_progress", "completed", "overdue"];
  if (duLieu.status && !trangThaiHopLe.includes(duLieu.status)) {
    danhSachLoi.push("Trang thai khong hop le.");
  }

  const mucUuTienHopLe = ["low", "medium", "high"];
  if (duLieu.priority && !mucUuTienHopLe.includes(duLieu.priority)) {
    danhSachLoi.push("Muc uu tien khong hop le.");
  }

  // Kiem tra han hoan thanh >= ngay bat dau
  if (duLieu.start_date && duLieu.due_date) {
    if (new Date(duLieu.due_date) < new Date(duLieu.start_date)) {
      danhSachLoi.push("Han hoan thanh khong duoc nho hon ngay bat dau.");
    }
  }

  return danhSachLoi;
}

/**
 * Lay tat ca cong viec cua nguoi dung
 */
async function layCongViecTheoNguoiDung(maNguoiDung) {
  return await congViecModel.layCongViecTheoNguoiDung(maNguoiDung);
}

/**
 * Lay cong viec theo ID
 */
async function layCongViecTheoId(maCongViec) {
  const congViec = await congViecModel.layCongViecTheoId(maCongViec);
  if (!congViec) {
    throw taoLoi("Khong tim thay cong viec.", 404);
  }
  return congViec;
}

/**
 * Tao cong viec moi
 */
async function taoCongViec(maNguoiDung, duLieuCongViec) {
  const danhSachLoi = kiemTraDuLieuCongViec(duLieuCongViec);
  if (danhSachLoi.length) {
    throw taoLoi(danhSachLoi.join(" "), 400);
  }

  return await congViecModel.taoCongViec({
    user_id: maNguoiDung,
    category_id: duLieuCongViec.category_id || null,
    title: duLieuCongViec.title.trim(),
    description: (duLieuCongViec.description || "").trim(),
    start_date: duLieuCongViec.start_date || null,
    due_date: duLieuCongViec.due_date || null,
    priority: duLieuCongViec.priority || "medium",
    status: duLieuCongViec.status || "pending",
  });
}

/**
 * Cap nhat cong viec
 */
async function capNhatCongViec(maCongViec, maNguoiDung, duLieuCongViec) {
  const danhSachLoi = kiemTraDuLieuCongViec(duLieuCongViec);
  if (danhSachLoi.length) {
    throw taoLoi(danhSachLoi.join(" "), 400);
  }

  const congViecCu = await congViecModel.layCongViecTheoId(maCongViec);
  if (!congViecCu) {
    throw taoLoi("Khong tim thay cong viec de sua.", 404);
  }

  // Kiem tra quyen so huu
  if (congViecCu.user_id !== maNguoiDung) {
    throw taoLoi("Ban khong co quyen sua cong viec nay.", 403);
  }

  // Neu chuyen sang completed, luu thoi diem hoan thanh
  let thoiDiemHoanThanh = congViecCu.completed_at;
  if (duLieuCongViec.status === "completed" && congViecCu.status !== "completed") {
    thoiDiemHoanThanh = new Date().toISOString();
  } else if (duLieuCongViec.status !== "completed") {
    thoiDiemHoanThanh = null;
  }

  return await congViecModel.capNhatCongViec(maCongViec, {
    category_id: duLieuCongViec.category_id || null,
    title: duLieuCongViec.title.trim(),
    description: (duLieuCongViec.description || "").trim(),
    start_date: duLieuCongViec.start_date || null,
    due_date: duLieuCongViec.due_date || null,
    priority: duLieuCongViec.priority || "medium",
    status: duLieuCongViec.status || "pending",
    completed_at: thoiDiemHoanThanh,
  });
}

/**
 * Cap nhat trang thai cong viec
 */
async function capNhatTrangThaiCongViec(maCongViec, maNguoiDung, trangThai) {
  const trangThaiHopLe = ["pending", "in_progress", "completed", "overdue"];
  if (!trangThaiHopLe.includes(trangThai)) {
    throw taoLoi("Trang thai khong hop le.", 400);
  }

  const congViec = await congViecModel.layCongViecTheoId(maCongViec);
  if (!congViec) {
    throw taoLoi("Khong tim thay cong viec.", 404);
  }

  if (congViec.user_id !== maNguoiDung) {
    throw taoLoi("Ban khong co quyen cap nhat cong viec nay.", 403);
  }

  const thoiDiemHoanThanh = trangThai === "completed" ? new Date().toISOString() : null;
  return await congViecModel.capNhatTrangThaiCongViec(maCongViec, trangThai, thoiDiemHoanThanh);
}

/**
 * Xoa cong viec
 */
async function xoaCongViec(maCongViec, maNguoiDung) {
  const congViec = await congViecModel.layCongViecTheoId(maCongViec);
  if (!congViec) {
    throw taoLoi("Khong tim thay cong viec de xoa.", 404);
  }

  if (congViec.user_id !== maNguoiDung) {
    throw taoLoi("Ban khong co quyen xoa cong viec nay.", 403);
  }

  await congViecModel.xoaCongViec(maCongViec);
  return congViec;
}

/**
 * Tim kiem va loc cong viec
 */
async function timKiemCongViec(maNguoiDung, boLoc) {
  return await congViecModel.timKiemCongViec(maNguoiDung, boLoc);
}

/**
 * Lay thong ke cong viec
 */
async function layThongKeCongViec(maNguoiDung) {
  return await congViecModel.layThongKeCongViec(maNguoiDung);
}

/**
 * Danh dau tu dong cac cong viec qua han
 */
async function danhDauCongViecQuaHan() {
  return await congViecModel.danhDauCongViecQuaHan();
}

module.exports = {
  layCongViecTheoNguoiDung,
  layCongViecTheoId,
  taoCongViec,
  capNhatCongViec,
  capNhatTrangThaiCongViec,
  xoaCongViec,
  timKiemCongViec,
  layThongKeCongViec,
  danhDauCongViecQuaHan,
};