const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Tai bien moi truong tu .env
require("dotenv").config();

// Tao ket noi pool PostgreSQL
const ketNoiPool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "task_manager",
});

// Kiem tra ket noi database
ketNoiPool.on("connect", () => {
  console.log("✅ Da ket noi PostgreSQL thanh cong.");
});

ketNoiPool.on("error", (loi) => {
  console.error("❌ Loi ket noi PostgreSQL:", loi.message);
});

/**
 * Khoi tao database: chay file init.sql de tao bang
 */
async function khoiTaoDatabase() {
  const noiDungSQL = fs.readFileSync(
    path.join(__dirname, "..", "database", "init.sql"),
    "utf8"
  );

  try {
    await ketNoiPool.query(noiDungSQL);
    console.log("✅ Da khoi tao cau truc bang database thanh cong.");
  } catch (loi) {
    console.error("❌ Loi khoi tao database:", loi.message);
    throw loi;
  }
}

/**
 * Helper: thuc thi truy van voi tham so
 * @param {string} cauLenh - Cau lenh SQL
 * @param {Array} thamSo - Tham so
 * @returns {Object} Ket qua truy van
 */
async function truyVan(cauLenh, thamSo) {
  const thoiDiemBatDau = Date.now();
  const ketQua = await ketNoiPool.query(cauLenh, thamSo);
  const thoiGian = Date.now() - thoiDiemBatDau;

  // Ghi log truy van trong moi truong phat trien
  if (process.env.NODE_ENV !== "production") {
    console.log("📝 Truy van:", { cauLenh: cauLenh.substring(0, 80), thoiGian: `${thoiGian}ms`, soDong: ketQua.rowCount });
  }

  return ketQua;
}

module.exports = {
  ketNoiPool,
  truyVan,
  khoiTaoDatabase,
};
