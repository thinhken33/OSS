require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const { khoiTaoDatabase } = require("./config/db");

// Import các routes (định tuyến)
const nguoiDungRoutes = require("./routes/nguoiDungRoutes");
const danhMucRoutes = require("./routes/danhMucRoutes");
const congViecRoutes = require("./routes/congViecRoutes");
const thongBaoRoutes = require("./routes/thongBaoRoutes");

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Middleware cơ bản
app.use(express.json()); // Phân tích các request có payload JSON
app.use(express.urlencoded({ extended: true })); // Phân tích các request dạng urlencoded
app.use(express.static(path.join(__dirname, "public"))); // Cung cấp các file tĩnh (HTML, CSS, JS) từ thư mục public

// Cấu hình CORS để cho phép frontend gọi API một cách an toàn
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
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
  res.status(err.statusCode || 500).json({
    message: err.message || "Lỗi hệ thống.",
  });
});

/**
 * Hàm khởi động server
 * Thử kết nối Database PostgreSQL trước, nếu thất bại vẫn tiếp tục bằng file JSON
 */
async function khoiDongServer() {
  try {
    // Thử kết nối database
    try {
      await khoiTaoDatabase();
      console.log("✅ Đã kết nối PostgreSQL thành công.");
    } catch (dbErr) {
      console.warn("⚠️ Không kết nối được PostgreSQL, hiện chỉ sử dụng file JSON:", dbErr.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("❌ Không thể khởi động server:", err.message);
    process.exit(1);
  }
}

khoiDongServer();