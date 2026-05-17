const express = require("express");
const nguoiDungController = require("../controllers/nguoiDungController");
const {
  xacThucDangNhap,
  xacThucTrungKhopUserParam,
  yeuCauQuyenAdmin,
} = require("../middlewares/xacThucMiddleware");

const router = express.Router();

// Public auth endpoints
router.post("/register", nguoiDungController.dangKy);
router.post("/login", nguoiDungController.dangNhap);

// Admin endpoints
router.get("/", xacThucDangNhap, yeuCauQuyenAdmin, nguoiDungController.layTatCaNguoiDung);
router.patch("/:id/lock", xacThucDangNhap, yeuCauQuyenAdmin, nguoiDungController.datTrangThaiKhoa);

// Owner endpoints (admin can also access)
router.get("/:id", xacThucDangNhap, xacThucTrungKhopUserParam("id", true), nguoiDungController.layNguoiDungTheoId);
router.put("/:id", xacThucDangNhap, xacThucTrungKhopUserParam("id", true), nguoiDungController.capNhatNguoiDung);
router.put("/:id/password", xacThucDangNhap, xacThucTrungKhopUserParam("id", true), nguoiDungController.doiMatKhau);
router.put("/:id/avatar", xacThucDangNhap, xacThucTrungKhopUserParam("id", true), nguoiDungController.capNhatAvatar);
router.delete("/:id/avatar", xacThucDangNhap, xacThucTrungKhopUserParam("id", true), nguoiDungController.xoaAvatar);
router.delete("/:id", xacThucDangNhap, xacThucTrungKhopUserParam("id", true), nguoiDungController.xoaNguoiDung);

module.exports = router;

