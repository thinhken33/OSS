const express = require("express");
const danhMucController = require("../controllers/danhMucController");
const {
  xacThucDangNhap,
  xacThucTrungKhopUserParam,
} = require("../middlewares/xacThucMiddleware");

const router = express.Router();

router.use(xacThucDangNhap);

router.get("/user/:userId", xacThucTrungKhopUserParam("userId"), danhMucController.layDanhMuc);
router.post("/user/:userId", xacThucTrungKhopUserParam("userId"), danhMucController.taoDanhMuc);
router.put("/:id/user/:userId", xacThucTrungKhopUserParam("userId"), danhMucController.capNhatDanhMuc);
router.delete("/:id/user/:userId", xacThucTrungKhopUserParam("userId"), danhMucController.xoaDanhMuc);
router.get("/:id", danhMucController.layDanhMucTheoId);

module.exports = router;

