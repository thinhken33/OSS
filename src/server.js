require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const { khoiTaoDatabase } = require("./config/db");
const db = require("./config/db");
const congViecService = require("./services/congViecService");
const thongBaoService = require("./services/thongBaoService");

// Import main router
const apiRoutes = require("./routes/index");

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 3000;

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, "../public", "uploads", "avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Middleware cơ bản
app.use(express.json()); // Phân tích các request có payload JSON
app.use(express.urlencoded({ extended: true })); // Phân tích các request dạng urlencoded
app.use(express.static(path.join(__dirname, "../public"))); // Cung cấp các file tĩnh (HTML, CSS, JS) từ thư mục public

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

// Kiểm tra trạng thái máy chủ (Health Check)
app.get("/api/health", (req, res) => {
  res.json({
    trangThai: "ok",
    thongBao: "Server đang hoạt động.",
    thoiGian: new Date().toISOString(),
  });
});

// === Các routes API (Sử dụng PostgreSQL) ===
app.use("/api", apiRoutes);



// === Xử lý trang lỗi 403 ===
app.get("/403", (req, res) => {
  res.status(403).sendFile(path.join(__dirname, "../public", "403.html"));
});

// === Xử lý trang lỗi 500 ===
app.get("/500", (req, res) => {
  res.status(500).sendFile(path.join(__dirname, "../public", "500.html"));
});

// === Xử lý route không tìm thấy (404) ===
app.use((req, res, next) => {
  // Nếu là API request, trả về JSON
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      message: "Không tìm thấy API endpoint: " + req.method + " " + req.path,
    });
  }
  // Nếu là request thường, trả về trang 404.html
  res.status(404).sendFile(path.join(__dirname, "../public", "404.html"));
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error("❌ Lỗi Server:", err.message);
  // Nếu là API request, trả về JSON
  if (req.path.startsWith("/api/")) {
    return res.status(err.statusCode || 500).json({
      message: err.message || "Lỗi hệ thống.",
    });
  }
  // Nếu là request thường, trả về trang 500.html
  res.status(500).sendFile(path.join(__dirname, "../public", "500.html"));
});

/**
 * Hàm khởi động server
 */
async function khoiDongServer() {
  try {
    await khoiTaoDatabase();
    console.log("✅ Đã kết nối PostgreSQL thành công.");

    // Tự động đánh dấu công việc quá hạn mỗi phút
    setInterval(async () => {
      try {
        await congViecService.danhDauCongViecQuaHan();
      } catch (err) {
        console.error("Lỗi khi tự động đánh dấu quá hạn:", err.message);
      }
    }, 60000);

    // Tự động kiểm tra và tạo thông báo nhắc nhở cho tất cả người dùng mỗi 30 giây
    setInterval(async () => {
      try {
        // Lấy danh sách tất cả user_id có công việc chưa hoàn thành
        const ketQua = await db.truyVan(
          `SELECT DISTINCT user_id FROM Tasks WHERE status NOT IN ('completed')`
        );
        const danhSachUserId = ketQua.rows.map(r => r.user_id);
        for (const userId of danhSachUserId) {
          try {
            await thongBaoService.taoThongBaoNhacViec(userId);
          } catch (err) {
            // Bỏ qua lỗi từng user, tiếp tục xử lý các user khác
          }
        }
      } catch (err) {
        console.error("Lỗi khi tự động tạo thông báo nhắc nhở:", err.message);
      }
    }, 30000);

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
