const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Load biến môi trường từ .env
require("dotenv").config();

// Tạo connection pool PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "task_manager",
});

// Kiểm tra kết nối database
pool.on("connect", () => {
  console.log("✅ Đã kết nối PostgreSQL thành công.");
});

pool.on("error", (err) => {
  console.error("❌ Lỗi kết nối PostgreSQL:", err.message);
});

/**
 * Khởi tạo database: chạy file init.sql để tạo bảng
 */
async function initializeDatabase() {
  const initSQL = fs.readFileSync(
    path.join(__dirname, "..", "database", "init.sql"),
    "utf8"
  );

  try {
    await pool.query(initSQL);
    console.log("✅ Đã khởi tạo cấu trúc bảng database thành công.");
  } catch (error) {
    console.error("❌ Lỗi khởi tạo database:", error.message);
    throw error;
  }
}

/**
 * Helper: thực thi query với tham số
 * @param {string} text - Câu lệnh SQL
 * @param {Array} params - Tham số
 * @returns {Object} Kết quả query
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  // Log query trong development
  if (process.env.NODE_ENV !== "production") {
    console.log("📝 Query:", { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
  }

  return result;
}

module.exports = {
  pool,
  query,
  initializeDatabase,
};
