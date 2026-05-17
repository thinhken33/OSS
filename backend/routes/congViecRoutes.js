const express = require("express");
const congViecController = require("../controllers/congViecController");
const {
  xacThucDangNhap,
  xacThucTrungKhopUserParam,
} = require("../middlewares/xacThucMiddleware");

const router = express.Router();

router.use(xacThucDangNhap);

router.get("/user/:userId", xacThucTrungKhopUserParam("userId"), congViecController.layCongViec);
router.get("/user/:userId/search", xacThucTrungKhopUserParam("userId"), congViecController.timKiemCongViec);
router.get("/user/:userId/stats", xacThucTrungKhopUserParam("userId"), congViecController.layThongKeCongViec);
router.post("/user/:userId", xacThucTrungKhopUserParam("userId"), congViecController.taoCongViec);
router.put("/:id/user/:userId", xacThucTrungKhopUserParam("userId"), congViecController.capNhatCongViec);
router.patch("/:id/user/:userId/status", xacThucTrungKhopUserParam("userId"), congViecController.capNhatTrangThaiCongViec);
router.delete("/:id/user/:userId", xacThucTrungKhopUserParam("userId"), congViecController.xoaCongViec);
router.get("/:id", congViecController.layCongViecTheoId);

module.exports = router;

