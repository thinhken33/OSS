const express = require("express");
const dieuKhienCongViec = require("../controllers/taskController");

const boTuyenDuong = express.Router();

// Lay tat ca cong viec cua nguoi dung
boTuyenDuong.get("/user/:userId", dieuKhienCongViec.layCongViec);

// Tim kiem & loc cong viec
boTuyenDuong.get("/user/:userId/search", dieuKhienCongViec.timKiemCongViec);

// Lay thong ke cong viec
boTuyenDuong.get("/user/:userId/stats", dieuKhienCongViec.layThongKeCongViec);

// Lay cong viec theo ID
boTuyenDuong.get("/:id", dieuKhienCongViec.layCongViecTheoId);

// Tao cong viec moi
boTuyenDuong.post("/user/:userId", dieuKhienCongViec.taoCongViec);

// Cap nhat cong viec
boTuyenDuong.put("/:id/user/:userId", dieuKhienCongViec.capNhatCongViec);

// Cap nhat trang thai cong viec
boTuyenDuong.patch("/:id/user/:userId/status", dieuKhienCongViec.capNhatTrangThaiCongViec);

// Xoa cong viec
boTuyenDuong.delete("/:id/user/:userId", dieuKhienCongViec.xoaCongViec);

module.exports = boTuyenDuong;