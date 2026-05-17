require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const { khoiTaoDatabase } = require("./config/db");
const congViecService = require("./services/congViecService");
const thongBaoService = require("./services/thongBaoService");

// Import các routes (định tuyến)
const nguoiDungRoutes = require("./routes/nguoiDungRoutes");
const danhMucRoutes = require("./routes/danhMucRoutes");
const congViecRoutes = require("./routes/congViecRoutes");
const thongBaoRoutes = require("./routes/thongBaoRoutes");

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 3000;
const THU_MUC_PUBLIC = path.join(__dirname, "public");
const THU_MUC_FRONTEND = path.join(__dirname, "..", "frontend");
const THU_MUC_TINH = fs.existsSync(THU_MUC_FRONTEND)
  ? THU_MUC_FRONTEND
  : THU_MUC_PUBLIC;

// Cấu hình Middleware cơ bản
// Tăng giới hạn để nhận avatar base64 từ trang cá nhân
const GIOI_HAN_BODY = 40 * 1024 * 1024; // 40MB
app.use(express.json({ limit: GIOI_HAN_BODY })); // Phân tích các request có payload JSON
app.use(express.urlencoded({ extended: true, limit: GIOI_HAN_BODY })); // Phân tích các request dạng urlencoded
app.use(express.static(THU_MUC_TINH)); // Cung cấp các file tĩnh (HTML, CSS, JS)

// Cấu hình CORS để cho phép frontend gọi API một cách an toàn
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // Xử lý các request OPTIONS (pre-flight)
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// === Các routes API (Sử dụng PostgreSQL) ===
app.use("/api/users", nguoiDungRoutes);
app.use("/api/categories", danhMucRoutes);
app.use("/api/tasks", congViecRoutes);
app.use("/api/notifications", thongBaoRoutes);

// Kiểm tra trạng thái máy chủ (Health Check)
app.get("/api/health", (req, res) => {
  res.json({
    trangThai: "ok",
    thongBao: "Server đang hoạt động.",
    thoiGian: new Date().toISOString(),
  });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error("❌ Lỗi Server:", err.message);
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({
      message: "Ảnh tải lên quá lớn. Vui lòng chọn ảnh nhỏ hơn hoặc giảm chất lượng ảnh.",
    });
  }
  res.status(err.statusCode || 500).json({
    message: err.message || "Lỗi hệ thống.",
  });
});

/**
 * Hàm khởi động server
 */
async function khoiDongServer() {
  try {
    await khoiTaoDatabase();
    console.log("✅ Đã kết nối PostgreSQL thành công.");

    // Tu dong dong bo trang thai cong viec va nhac viec moi phut
    setInterval(async () => {
      try {
        await congViecService.danhDauCongViecQuaHan();
        await thongBaoService.taoThongBaoNhacViec();
      } catch (err) {
        console.error("Loi khi tu dong xu ly cong viec/thong bao:", err.message);
      }
    }, 60000);

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error(
      "❌ Không thể khởi động server do lỗi Database:",
      err.message,
    );
    process.exit(1);
  }
}

khoiDongServer();
