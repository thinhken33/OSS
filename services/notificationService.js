const thongBaoModel = require("../models/notificationModel");
const congViecModel = require("../models/taskModel");

function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}

/**
 * Lay tat ca thong bao cua nguoi dung
 */
async function layThongBaoTheoNguoiDung(maNguoiDung) {
  return await thongBaoModel.layThongBaoTheoNguoiDung(maNguoiDung);
}

/**
 * Lay thong bao chua doc
 */
async function layThongBaoChuaDoc(maNguoiDung) {
  return await thongBaoModel.layThongBaoChuaDoc(maNguoiDung);
}

/**
 * Dem thong bao chua doc
 */
async function demThongBaoChuaDoc(maNguoiDung) {
  return await thongBaoModel.demThongBaoChuaDoc(maNguoiDung);
}

/**
 * Tao thong bao moi
 */
async function taoThongBao({ user_id, task_id, message }) {
  if (!message || !message.trim()) {
    throw taoLoi("Noi dung thong bao khong duoc de trong.", 400);
  }

  return await thongBaoModel.taoThongBao({
    user_id,
    task_id: task_id || null,
    message: message.trim(),
  });
}

/**
 * Danh dau da doc mot thong bao
 */
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

/**
 * Danh dau tat ca la da doc
 */
async function danhDauTatCaDaDoc(maNguoiDung) {
  return await thongBaoModel.danhDauTatCaDaDoc(maNguoiDung);
}

/**
 * Xoa thong bao
 */
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

/**
 * Tao thong bao nhac viec cho cong viec sap han / qua han
 */
async function taoThongBaoNhacViec(maNguoiDung) {
  const danhSachCongViec = await congViecModel.layCongViecQuaHanVaSapDenHan(maNguoiDung);
  const danhSachThongBao = [];

  for (const congViec of danhSachCongViec) {
    const bayGio = new Date();
    const hanHoanThanh = new Date(congViec.due_date);
    let noiDung;

    if (hanHoanThanh < bayGio) {
      noiDung = `Cong viec "${congViec.title}" da qua han!`;
    } else {
      noiDung = `Cong viec "${congViec.title}" sap den han (${hanHoanThanh.toLocaleDateString("vi-VN")}).`;
    }

    const thongBaoMoi = await thongBaoModel.taoThongBao({
      user_id: maNguoiDung,
      task_id: congViec.task_id,
      message: noiDung,
    });
    danhSachThongBao.push(thongBaoMoi);
  }

  return danhSachThongBao;
}

module.exports = {
  layThongBaoTheoNguoiDung,
  layThongBaoChuaDoc,
  demThongBaoChuaDoc,
  taoThongBao,
  danhDauDaDoc,
  danhDauTatCaDaDoc,
  xoaThongBao,
  taoThongBaoNhacViec,
};
