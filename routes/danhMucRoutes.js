const express = require("express");
const dieuKhienDanhMuc = require("../controllers/danhMucController");

const boTuyenDuong = express.Router();

// Lay tat ca danh muc cua nguoi dung
boTuyenDuong.get("/user/:userId", dieuKhienDanhMuc.layDanhMuc);

// Lay danh muc theo ID
boTuyenDuong.get("/:id", dieuKhienDanhMuc.layDanhMucTheoId);

// Tao danh muc moi
boTuyenDuong.post("/user/:userId", dieuKhienDanhMuc.taoDanhMuc);

// Cap nhat danh muc
boTuyenDuong.put("/:id/user/:userId", dieuKhienDanhMuc.capNhatDanhMuc);

// Xoa danh muc
boTuyenDuong.delete("/:id/user/:userId", dieuKhienDanhMuc.xoaDanhMuc);

module.exports = boTuyenDuong;
