const congViecModel = require("../models/congViecModel");
const danhMucModel = require("../models/danhMucModel");

const TRANG_THAI_NGUOI_DUNG_HOP_LE = ["pending", "in_progress", "completed"];
const MUC_UU_TIEN_HOP_LE = ["low", "medium", "high"];
const MOC_NHAC_HOP_LE = [0, 30, 60];

function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}

function laNgayHopLe(giaTriNgay) {
  if (giaTriNgay === null || giaTriNgay === undefined || giaTriNgay === "") return true;
  const ngay = new Date(giaTriNgay);
  return !Number.isNaN(ngay.getTime());
}

function laQuaHanTheoHanChot(hanHoanThanh) {
  if (!hanHoanThanh) return false;
  const ngayHan = new Date(hanHoanThanh);
  if (Number.isNaN(ngayHan.getTime())) return false;
  return ngayHan.getTime() < Date.now();
}

function suyRaTrangThaiDangLamMacDinh(startDate) {
  if (!startDate) return "pending";
  const ngayBatDau = new Date(startDate);
  if (Number.isNaN(ngayBatDau.getTime())) return "pending";
  return ngayBatDau.getTime() <= Date.now() ? "in_progress" : "pending";
}

function tinhTrangThaiHeThong(duLieu, trangThaiMacDinh) {
  if (duLieu.status === "completed") return "completed";
  if (laQuaHanTheoHanChot(duLieu.due_date)) return "overdue";

  if (duLieu.status === "pending" || duLieu.status === "in_progress") {
    return duLieu.status;
  }

  if (duLieu.status === "overdue") {
    return trangThaiMacDinh === "in_progress" ? "in_progress" : "pending";
  }

  return trangThaiMacDinh === "in_progress" ? "in_progress" : "pending";
}

function chuanHoaMaDanhMuc(categoryId) {
  if (categoryId === null || categoryId === undefined || categoryId === "") return null;
  const maDanhMuc = Number.parseInt(categoryId, 10);
  if (!Number.isInteger(maDanhMuc) || maDanhMuc <= 0) {
    throw taoLoi("Danh muc khong hop le.", 400);
  }
  return maDanhMuc;
}

function chuanHoaMocNhac(reminderMinutes, macDinh = 0) {
  if (reminderMinutes === null || reminderMinutes === undefined || reminderMinutes === "") {
    return macDinh;
  }
  const giaTri = Number.parseInt(reminderMinutes, 10);
  if (!Number.isInteger(giaTri)) {
    throw taoLoi("Moc nhac viec khong hop le.", 400);
  }
  return giaTri;
}

function layMocThoiGian(giaTriNgay) {
  if (!giaTriNgay) return null;
  const ngay = new Date(giaTriNgay);
  if (Number.isNaN(ngay.getTime())) return null;
  return ngay.getTime();
}

async function kiemTraDanhMucThuocNguoiDung(maNguoiDung, categoryId) {
  const maDanhMuc = chuanHoaMaDanhMuc(categoryId);
  if (maDanhMuc === null) return null;

  const danhMuc = await danhMucModel.layDanhMucTheoId(maDanhMuc);
  if (!danhMuc) {
    throw taoLoi("Danh muc khong ton tai.", 404);
  }

  if (danhMuc.user_id !== maNguoiDung) {
    throw taoLoi("Ban khong the gan cong viec vao danh muc cua nguoi dung khac.", 403);
  }

  return maDanhMuc;
}

function chuanHoaDuLieuCongViec(duLieuCongViec, duLieuMacDinh = {}) {
  const nguon = duLieuCongViec && typeof duLieuCongViec === "object" ? duLieuCongViec : {};

  const duLieuDaChuanHoa = {
    title: nguon.title ?? duLieuMacDinh.title,
    description: nguon.description ?? duLieuMacDinh.description ?? "",
    start_date: nguon.start_date ?? duLieuMacDinh.start_date ?? null,
    due_date: nguon.due_date ?? duLieuMacDinh.due_date ?? null,
    priority: nguon.priority ?? duLieuMacDinh.priority ?? "medium",
    status: nguon.status ?? duLieuMacDinh.status ?? "pending",
    category_id: nguon.category_id ?? duLieuMacDinh.category_id ?? null,
    reminder_minutes: chuanHoaMocNhac(
      nguon.reminder_minutes,
      duLieuMacDinh.reminder_minutes ?? 0,
    ),
  };

  if (typeof duLieuDaChuanHoa.title === "string") {
    duLieuDaChuanHoa.title = duLieuDaChuanHoa.title.trim();
  }

  if (typeof duLieuDaChuanHoa.description === "string") {
    duLieuDaChuanHoa.description = duLieuDaChuanHoa.description.trim();
  }

  if (duLieuDaChuanHoa.start_date === "") duLieuDaChuanHoa.start_date = null;
  if (duLieuDaChuanHoa.due_date === "") duLieuDaChuanHoa.due_date = null;
  if (duLieuDaChuanHoa.category_id === "") duLieuDaChuanHoa.category_id = null;

  return duLieuDaChuanHoa;
}

function kiemTraDuLieuCongViec(duLieu) {
  const danhSachLoi = [];

  if (!duLieu.title || typeof duLieu.title !== "string" || !duLieu.title.trim()) {
    danhSachLoi.push("Ten cong viec khong duoc de trong.");
  }

  if (!TRANG_THAI_NGUOI_DUNG_HOP_LE.includes(duLieu.status)) {
    danhSachLoi.push("Trang thai khong hop le.");
  }

  if (!MUC_UU_TIEN_HOP_LE.includes(duLieu.priority)) {
    danhSachLoi.push("Muc uu tien khong hop le.");
  }

  if (!MOC_NHAC_HOP_LE.includes(duLieu.reminder_minutes)) {
    danhSachLoi.push("Moc nhac viec khong hop le.");
  }

  if (!laNgayHopLe(duLieu.start_date)) {
    danhSachLoi.push("Ngay bat dau khong hop le.");
  }

  if (!laNgayHopLe(duLieu.due_date)) {
    danhSachLoi.push("Ngay het han khong hop le.");
  }

  if (laNgayHopLe(duLieu.start_date) && laNgayHopLe(duLieu.due_date) && duLieu.start_date && duLieu.due_date) {
    if (new Date(duLieu.start_date) > new Date(duLieu.due_date)) {
      danhSachLoi.push("Ngay bat dau khong duoc lon hon ngay het han.");
    }
  }

  return danhSachLoi;
}

async function layCongViecTheoNguoiDung(maNguoiDung) {
  return await congViecModel.layCongViecTheoNguoiDung(maNguoiDung);
}

async function layCongViecTheoId(maCongViec) {
  const congViec = await congViecModel.layCongViecTheoId(maCongViec);
  if (!congViec) {
    throw taoLoi("Khong tim thay cong viec.", 404);
  }
  return congViec;
}

async function taoCongViec(maNguoiDung, duLieuCongViec) {
  const duLieuDaChuanHoa = chuanHoaDuLieuCongViec(duLieuCongViec, {
    description: "",
    start_date: null,
    due_date: null,
    priority: "medium",
    status: "pending",
    category_id: null,
    reminder_minutes: 0,
  });

  const danhSachLoi = kiemTraDuLieuCongViec(duLieuDaChuanHoa);
  if (danhSachLoi.length) {
    throw taoLoi(danhSachLoi.join(" "), 400);
  }

  const maDanhMuc = await kiemTraDanhMucThuocNguoiDung(maNguoiDung, duLieuDaChuanHoa.category_id);

  const trangThaiMacDinh = duLieuDaChuanHoa.status === "in_progress"
    ? "in_progress"
    : suyRaTrangThaiDangLamMacDinh(duLieuDaChuanHoa.start_date);
  const trangThaiSauCung = tinhTrangThaiHeThong(duLieuDaChuanHoa, trangThaiMacDinh);
  const thoiDiemHoanThanh = trangThaiSauCung === "completed" ? new Date().toISOString() : null;

  return await congViecModel.taoCongViec({
    user_id: maNguoiDung,
    category_id: maDanhMuc,
    title: duLieuDaChuanHoa.title,
    description: duLieuDaChuanHoa.description,
    start_date: duLieuDaChuanHoa.start_date,
    due_date: duLieuDaChuanHoa.due_date,
    priority: duLieuDaChuanHoa.priority,
    status: trangThaiSauCung,
    completed_at: thoiDiemHoanThanh,
    reminder_minutes: duLieuDaChuanHoa.reminder_minutes,
    reminder_sent_at: null,
    due_soon_sent_at: null,
  });
}

async function capNhatCongViec(maCongViec, maNguoiDung, duLieuCongViec) {
  const congViecCu = await congViecModel.layCongViecTheoId(maCongViec);
  if (!congViecCu) {
    throw taoLoi("Khong tim thay cong viec de sua.", 404);
  }

  if (congViecCu.user_id !== maNguoiDung) {
    throw taoLoi("Ban khong co quyen sua cong viec nay.", 403);
  }

  const duLieuDaChuanHoa = chuanHoaDuLieuCongViec(duLieuCongViec, {
    title: congViecCu.title,
    description: congViecCu.description || "",
    start_date: congViecCu.start_date || null,
    due_date: congViecCu.due_date || null,
    priority: congViecCu.priority,
    status: TRANG_THAI_NGUOI_DUNG_HOP_LE.includes(congViecCu.status)
      ? congViecCu.status
      : suyRaTrangThaiDangLamMacDinh(congViecCu.start_date),
    category_id: congViecCu.category_id || null,
    reminder_minutes: congViecCu.reminder_minutes ?? 0,
  });

  const danhSachLoi = kiemTraDuLieuCongViec(duLieuDaChuanHoa);
  if (danhSachLoi.length) {
    throw taoLoi(danhSachLoi.join(" "), 400);
  }

  const maDanhMuc = await kiemTraDanhMucThuocNguoiDung(maNguoiDung, duLieuDaChuanHoa.category_id);

  const trangThaiTienTrinhCu = congViecCu.status === "in_progress" || congViecCu.status === "pending"
    ? congViecCu.status
    : suyRaTrangThaiDangLamMacDinh(duLieuDaChuanHoa.start_date || congViecCu.start_date);
  const trangThaiSauCung = tinhTrangThaiHeThong(duLieuDaChuanHoa, trangThaiTienTrinhCu);

  let thoiDiemHoanThanh = congViecCu.completed_at;
  if (trangThaiSauCung === "completed" && congViecCu.status !== "completed") {
    thoiDiemHoanThanh = new Date().toISOString();
  } else if (trangThaiSauCung !== "completed") {
    thoiDiemHoanThanh = null;
  }

  const thayDoiMocNhac = (congViecCu.reminder_minutes ?? 0) !== duLieuDaChuanHoa.reminder_minutes;
  const thayDoiHan = layMocThoiGian(congViecCu.due_date) !== layMocThoiGian(duLieuDaChuanHoa.due_date);
  const moLaiTuDaHoanThanh = congViecCu.status === "completed" && trangThaiSauCung !== "completed";

  let reminderSentAt = congViecCu.reminder_sent_at || null;
  let dueSoonSentAt = congViecCu.due_soon_sent_at || null;
  if (
    trangThaiSauCung === "completed"
    || duLieuDaChuanHoa.reminder_minutes === 0
    || !duLieuDaChuanHoa.due_date
  ) {
    reminderSentAt = null;
  } else if (thayDoiMocNhac || thayDoiHan || moLaiTuDaHoanThanh) {
    reminderSentAt = null;
  }

  if (trangThaiSauCung === "completed" || !duLieuDaChuanHoa.due_date) {
    dueSoonSentAt = null;
  } else if (thayDoiHan || moLaiTuDaHoanThanh) {
    dueSoonSentAt = null;
  }

  return await congViecModel.capNhatCongViec(maCongViec, {
    category_id: maDanhMuc,
    title: duLieuDaChuanHoa.title,
    description: duLieuDaChuanHoa.description,
    start_date: duLieuDaChuanHoa.start_date,
    due_date: duLieuDaChuanHoa.due_date,
    priority: duLieuDaChuanHoa.priority,
    status: trangThaiSauCung,
    completed_at: thoiDiemHoanThanh,
    reminder_minutes: duLieuDaChuanHoa.reminder_minutes,
    reminder_sent_at: reminderSentAt,
    due_soon_sent_at: dueSoonSentAt,
  });
}

async function capNhatTrangThaiCongViec(maCongViec, maNguoiDung, trangThai) {
  if (!TRANG_THAI_NGUOI_DUNG_HOP_LE.includes(trangThai)) {
    throw taoLoi("Trang thai khong hop le.", 400);
  }

  const congViec = await congViecModel.layCongViecTheoId(maCongViec);
  if (!congViec) {
    throw taoLoi("Khong tim thay cong viec.", 404);
  }

  if (congViec.user_id !== maNguoiDung) {
    throw taoLoi("Ban khong co quyen cap nhat cong viec nay.", 403);
  }

  let trangThaiSauCung = trangThai;
  if (trangThai !== "completed" && laQuaHanTheoHanChot(congViec.due_date)) {
    trangThaiSauCung = "overdue";
  }

  const thoiDiemHoanThanh = trangThaiSauCung === "completed" ? new Date().toISOString() : null;
  let reminderSentAt = congViec.reminder_sent_at || null;
  let dueSoonSentAt = congViec.due_soon_sent_at || null;
  const moLaiTuDaHoanThanh = congViec.status === "completed" && trangThaiSauCung !== "completed";
  if (trangThaiSauCung === "completed" || moLaiTuDaHoanThanh) {
    reminderSentAt = null;
    dueSoonSentAt = null;
  }

  return await congViecModel.capNhatTrangThaiCongViec(
    maCongViec,
    trangThaiSauCung,
    thoiDiemHoanThanh,
    reminderSentAt,
    dueSoonSentAt,
  );
}

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

async function timKiemCongViec(maNguoiDung, boLoc) {
  return await congViecModel.timKiemCongViec(maNguoiDung, boLoc);
}

async function layThongKeCongViec(maNguoiDung) {
  return await congViecModel.layThongKeCongViec(maNguoiDung);
}

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
