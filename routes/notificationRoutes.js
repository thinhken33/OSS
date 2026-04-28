const express = require("express");
const dieuKhienThongBao = require("../controllers/notificationController");

const boTuyenDuong = express.Router();

// Lay tat ca thong bao cua nguoi dung
boTuyenDuong.get("/user/:userId", dieuKhienThongBao.layThongBao);

// Lay thong bao chua doc
boTuyenDuong.get("/user/:userId/unread", dieuKhienThongBao.layThongBaoChuaDoc);

// Dem thong bao chua doc
boTuyenDuong.get("/user/:userId/unread/count", dieuKhienThongBao.demChuaDoc);

// Tao thong bao moi
boTuyenDuong.post("/user/:userId", dieuKhienThongBao.taoThongBao);

// Tao thong bao nhac viec tu dong
boTuyenDuong.post("/user/:userId/reminders", dieuKhienThongBao.taoNhacViec);

// Danh dau tat ca da doc
boTuyenDuong.patch("/user/:userId/read-all", dieuKhienThongBao.danhDauTatCaDaDoc);

// Danh dau da doc mot thong bao
boTuyenDuong.patch("/:id/user/:userId/read", dieuKhienThongBao.danhDauDaDoc);

// Xoa thong bao
boTuyenDuong.delete("/:id/user/:userId", dieuKhienThongBao.xoaThongBao);

module.exports = boTuyenDuong;
