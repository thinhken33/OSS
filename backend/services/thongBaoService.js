const thongBaoModel = require("../models/thongBaoModel");
const congViecModel = require("../models/congViecModel");

const LOAI_THONG_BAO_MAC_DINH = "general";
const LOAI_THONG_BAO_SAP_DEN_HAN = "due_soon";
const LOAI_THONG_BAO_NHAC_VIEC = "reminder";

function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}

function chuanHoaLoaiThongBao(loaiThongBao) {
  if (loaiThongBao === undefined || loaiThongBao === null || loaiThongBao === "") {
    return LOAI_THONG_BAO_MAC_DINH;
  }

  if (typeof loaiThongBao !== "string") {
    throw taoLoi("Loai thong bao khong hop le.", 400);
  }

  const loaiDaTrim = loaiThongBao.trim().toLowerCase();
  if (!/^[a-z][a-z0-9_]{1,49}$/.test(loaiDaTrim)) {
    throw taoLoi("Loai thong bao khong hop le.", 400);
  }

  return loaiDaTrim;
}

function dinhDangMocNhac(reminderMinutes) {
  if (reminderMinutes === 60) return "1 gio";
  if (reminderMinutes === 30) return "30 phut";
  return "khong xac dinh";
}

function dinhDangHan(dueDate) {
  if (!dueDate) return "";
  const ngay = new Date(dueDate);
  if (Number.isNaN(ngay.getTime())) return "";
  return ngay.toLocaleString("vi-VN");
}

async function layThongBaoTheoNguoiDung(maNguoiDung) {
  return await thongBaoModel.layThongBaoTheoNguoiDung(maNguoiDung);
}

async function layThongBaoChuaDoc(maNguoiDung) {
  return await thongBaoModel.layThongBaoChuaDoc(maNguoiDung);
}

async function demThongBaoChuaDoc(maNguoiDung) {
  return await thongBaoModel.demThongBaoChuaDoc(maNguoiDung);
}

async function taoThongBao({ user_id, task_id, message, notification_type }) {
  if (!message || !message.trim()) {
    throw taoLoi("Noi dung thong bao khong duoc de trong.", 400);
  }

  let maCongViec = task_id || null;
  if (maCongViec !== null) {
    const maCongViecDaParse = Number.parseInt(maCongViec, 10);
    if (!Number.isInteger(maCongViecDaParse) || maCongViecDaParse <= 0) {
      throw taoLoi("ID cong viec khong hop le.", 400);
    }

    const congViec = await congViecModel.layCongViecTheoId(maCongViecDaParse);
    if (!congViec) {
      throw taoLoi("Khong tim thay cong viec de gan thong bao.", 404);
    }
    if (congViec.user_id !== user_id) {
      throw taoLoi("Ban khong co quyen tao thong bao cho cong viec cua nguoi khac.", 403);
    }
    maCongViec = maCongViecDaParse;
  }

  return await thongBaoModel.taoThongBao({
    user_id,
    task_id: maCongViec,
    message: message.trim(),
    notification_type: chuanHoaLoaiThongBao(notification_type),
  });
}

async function danhDauDaDoc(maThongBao, maNguoiDung) {
  const thongBaoHienTai = await thongBaoModel.layThongBaoTheoId(maThongBao);
  if (!thongBaoHienTai) {
    throw taoLoi("Khong tim thay thong bao.", 404);
  }

  if (thongBaoHienTai.user_id !== maNguoiDung) {
    throw taoLoi("Ban khong co quyen thao tac thong bao nay.", 403);
  }

  return await thongBaoModel.danhDauDaDoc(maThongBao);
}

async function danhDauTatCaDaDoc(maNguoiDung) {
  return await thongBaoModel.danhDauTatCaDaDoc(maNguoiDung);
}

async function xoaThongBao(maThongBao, maNguoiDung) {
  const thongBaoHienTai = await thongBaoModel.layThongBaoTheoId(maThongBao);
  if (!thongBaoHienTai) {
    throw taoLoi("Khong tim thay thong bao de xoa.", 404);
  }

  if (thongBaoHienTai.user_id !== maNguoiDung) {
    throw taoLoi("Ban khong co quyen xoa thong bao nay.", 403);
  }

  await thongBaoModel.xoaThongBao(maThongBao);
  return thongBaoHienTai;
}

async function xoaTatCaThongBao(maNguoiDung) {
  return await thongBaoModel.xoaTatCaThongBao(maNguoiDung);
}

async function taoThongBaoSapDenHan(maNguoiDung = null) {
  const danhSachCongViec = await congViecModel.layCongViecSapDenHan(maNguoiDung);
  const danhSachThongBao = [];

  for (const congViec of danhSachCongViec) {
    // Danh dau truoc de tranh gui lap khi server quet dinh ky lien tuc.
    const congViecDaDanhDau = await congViecModel.danhDauDaGuiThongBaoSapDenHan(congViec.task_id);
    if (!congViecDaDanhDau) {
      continue;
    }

    const han = dinhDangHan(congViecDaDanhDau.due_date);
    const noiDung = han
      ? `Cong viec "${congViecDaDanhDau.title}" sap den han luc ${han}.`
      : `Cong viec "${congViecDaDanhDau.title}" sap den han.`;

    const thongBaoMoi = await thongBaoModel.taoThongBao({
      user_id: congViecDaDanhDau.user_id,
      task_id: congViecDaDanhDau.task_id,
      message: noiDung,
      notification_type: LOAI_THONG_BAO_SAP_DEN_HAN,
    });

    danhSachThongBao.push(thongBaoMoi);
  }

  return danhSachThongBao;
}

async function taoThongBaoTheoMocNhac(maNguoiDung = null) {
  const danhSachCongViec = await congViecModel.layCongViecDenMocNhac(maNguoiDung);
  const danhSachThongBao = [];

  for (const congViec of danhSachCongViec) {
    // Danh dau truoc de tranh gui lap khi server quet dinh ky lien tuc.
    const congViecDaDanhDau = await congViecModel.danhDauDaGuiNhacViec(congViec.task_id);
    if (!congViecDaDanhDau) {
      continue;
    }

    const mocNhac = dinhDangMocNhac(congViecDaDanhDau.reminder_minutes);
    const han = dinhDangHan(congViecDaDanhDau.due_date);
    const noiDung = han
      ? `Cong viec "${congViecDaDanhDau.title}" sap den han luc ${han} (nhac truoc ${mocNhac}).`
      : `Cong viec "${congViecDaDanhDau.title}" sap den han (nhac truoc ${mocNhac}).`;

    const thongBaoMoi = await thongBaoModel.taoThongBao({
      user_id: congViecDaDanhDau.user_id,
      task_id: congViecDaDanhDau.task_id,
      message: noiDung,
      notification_type: LOAI_THONG_BAO_NHAC_VIEC,
    });

    danhSachThongBao.push(thongBaoMoi);
  }

  return danhSachThongBao;
}

async function taoThongBaoNhacViec(maNguoiDung = null) {
  const [thongBaoSapDenHan, thongBaoNhacViec] = await Promise.all([
    taoThongBaoSapDenHan(maNguoiDung),
    taoThongBaoTheoMocNhac(maNguoiDung),
  ]);

  return [...thongBaoSapDenHan, ...thongBaoNhacViec];
}

module.exports = {
  layThongBaoTheoNguoiDung,
  layThongBaoChuaDoc,
  demThongBaoChuaDoc,
  taoThongBao,
  danhDauDaDoc,
  danhDauTatCaDaDoc,
  xoaThongBao,
  xoaTatCaThongBao,
  taoThongBaoSapDenHan,
  taoThongBaoNhacViec,
};
