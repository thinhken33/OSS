const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Tải biến môi trường từ file .env
require("dotenv").config();

// Tạo một Database Pool (Nhóm kết nối) của PostgreSQL
// Thay vì tạo kết nối mới mỗi lần truy vấn, Pool sẽ tái sử dụng các kết nối để tối ưu hiệu năng
const ketNoiPool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "task_manager",
});

// Lắng nghe sự kiện khi kết nối cơ sở dữ liệu thành công
ketNoiPool.on("connect", () => {
  console.log("✅ Đã kết nối PostgreSQL thành công.");
});

// Bắt lỗi nếu có sự cố mất kết nối đột ngột từ cơ sở dữ liệu
ketNoiPool.on("error", (loi) => {
  console.error("❌ Lỗi kết nối PostgreSQL:", loi.message);
});

/**
 * Khởi tạo Cơ sở dữ liệu
 * Hàm này sẽ đọc file init.sql và thực thi để tự động tạo cấu trúc bảng nếu chúng chưa tồn tại.
 * Được gọi khi server vừa khởi động.
 */
async function khoiTaoDatabase() {
  const noiDungSQL = fs.readFileSync(
    path.join(__dirname, "..", "database", "init.sql"),
    "utf8"
  );

  try {
    await ketNoiPool.query(noiDungSQL);
    console.log("✅ Đã khởi tạo cấu trúc bảng database thành công.");
  } catch (loi) {
    console.error("❌ Lỗi khởi tạo database:", loi.message);
    throw loi;
  }
}

/**
 * Hàm hỗ trợ (Helper) để thực thi câu truy vấn SQL an toàn
 * Tất cả các thao tác gọi xuống CSDL trong Models đều qua hàm này để tự động log thời gian chạy.
 *
 * @param {string} cauLenh - Câu lệnh SQL (ví dụ: SELECT * FROM Users WHERE id = $1)
 * @param {Array} thamSo - Mảng chứa các tham số truyền vào câu lệnh (để chống SQL Injection)
 * @returns {Promise<Object>} Đối tượng kết quả trả về từ PostgreSQL (chứa mảng rows và rowCount)
 */
async function truyVan(cauLenh, thamSo) {
  const thoiDiemBatDau = Date.now();
  const ketQua = await ketNoiPool.query(cauLenh, thamSo);
  const thoiGian = Date.now() - thoiDiemBatDau;

  // Chỉ ghi log câu lệnh truy vấn khi đang ở môi trường phát triển (Development)
  if (process.env.NODE_ENV !== "production") {
    console.log("📝 Truy vấn:", { cauLenh: cauLenh.substring(0, 80), thoiGian: `${thoiGian}ms`, soDong: ketQua.rowCount });
  }

  return ketQua;
}

module.exports = {
  ketNoiPool,
  truyVan,
  khoiTaoDatabase,
};
