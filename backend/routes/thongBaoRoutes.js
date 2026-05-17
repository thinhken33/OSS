const express = require("express");
const thongBaoController = require("../controllers/thongBaoController");
const {
  xacThucDangNhap,
  xacThucTrungKhopUserParam,
} = require("../middlewares/xacThucMiddleware");

const router = express.Router();

router.use(xacThucDangNhap);

router.get("/user/:userId", xacThucTrungKhopUserParam("userId"), thongBaoController.layThongBao);
router.get("/user/:userId/unread", xacThucTrungKhopUserParam("userId"), thongBaoController.layThongBaoChuaDoc);
router.get("/user/:userId/unread/count", xacThucTrungKhopUserParam("userId"), thongBaoController.demChuaDoc);
router.post("/user/:userId", xacThucTrungKhopUserParam("userId"), thongBaoController.taoThongBao);
router.post("/user/:userId/reminders", xacThucTrungKhopUserParam("userId"), thongBaoController.taoNhacViec);
router.patch("/user/:userId/read-all", xacThucTrungKhopUserParam("userId"), thongBaoController.danhDauTatCaDaDoc);
router.delete("/user/:userId/all", xacThucTrungKhopUserParam("userId"), thongBaoController.xoaTatCaThongBao);
router.patch("/:id/user/:userId/read", xacThucTrungKhopUserParam("userId"), thongBaoController.danhDauDaDoc);
router.delete("/:id/user/:userId", xacThucTrungKhopUserParam("userId"), thongBaoController.xoaThongBao);

module.exports = router;

