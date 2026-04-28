const express = require("express");
const dieuKhienNguoiDung = require("../controllers/nguoiDungController");

const boTuyenDuong = express.Router();

// Dang ky & Dang nhap
boTuyenDuong.post("/register", dieuKhienNguoiDung.dangKy);
boTuyenDuong.post("/login", dieuKhienNguoiDung.dangNhap);

// Lay danh sach tat ca nguoi dung (Admin)
boTuyenDuong.get("/", dieuKhienNguoiDung.layTatCaNguoiDung);

// Lay thong tin nguoi dung theo ID
boTuyenDuong.get("/:id", dieuKhienNguoiDung.layNguoiDungTheoId);

// Cap nhat thong tin ca nhan
boTuyenDuong.put("/:id", dieuKhienNguoiDung.capNhatNguoiDung);

// Doi mat khau
boTuyenDuong.put("/:id/password", dieuKhienNguoiDung.doiMatKhau);

// Khoa/mo khoa tai khoan (Admin)
boTuyenDuong.patch("/:id/lock", dieuKhienNguoiDung.datTrangThaiKhoa);

// Xoa nguoi dung
boTuyenDuong.delete("/:id", dieuKhienNguoiDung.xoaNguoiDung);

module.exports = boTuyenDuong;
