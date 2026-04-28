require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const { khoiTaoDatabase } = require("./config/db");

// Nhap cac tuyen duong
const tuyenDuongNguoiDung = require("./routes/userRoutes");
const tuyenDuongDanhMuc = require("./routes/categoryRoutes");
const tuyenDuongCongViec = require("./routes/taskRoutes");
const tuyenDuongThongBao = require("./routes/notificationRoutes");

const ungDung = express();
const CONG = process.env.PORT || 3000;

// Duong dan file du lieu JSON
const DUONG_DAN_DU_LIEU = path.join(__dirname, "data", "tasks.json");

// Middleware
ungDung.use(express.json());
ungDung.use(express.urlencoded({ extended: true }));
ungDung.use(express.static(path.join(__dirname, "public")));

// CORS (cho phep frontend goi API)
ungDung.use((yeuCau, phanHoi, tiepTheo) => {
  phanHoi.header("Access-Control-Allow-Origin", "*");
  phanHoi.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  phanHoi.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (yeuCau.method === "OPTIONS") {
    return phanHoi.sendStatus(200);
  }
  tiepTheo();
});

// === API don gian voi file JSON (cho frontend hoat dong doc lap) ===

// Doc du lieu tu file JSON
function docDuLieu() {
  try {
    const noiDung = fs.readFileSync(DUONG_DAN_DU_LIEU, "utf8");
    return JSON.parse(noiDung);
  } catch (loi) {
    return [];
  }
}

// Ghi du lieu vao file JSON
function ghiDuLieu(danhSachCongViec) {
  fs.writeFileSync(DUONG_DAN_DU_LIEU, JSON.stringify(danhSachCongViec, null, 2), "utf8");
}

// Tao ID ngau nhien
function taoId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// Lay tat ca cong viec
ungDung.get("/api/tasks", (yeuCau, phanHoi) => {
  const danhSachCongViec = docDuLieu();
  phanHoi.json(danhSachCongViec);
});

// Tao cong viec moi
ungDung.post("/api/tasks", (yeuCau, phanHoi) => {
  const danhSachCongViec = docDuLieu();
  const congViecMoi = {
    id: taoId(),
    title: yeuCau.body.title || "",
    description: yeuCau.body.description || "",
    status: yeuCau.body.status || "not-started",
    priority: yeuCau.body.priority || "medium",
    dueDate: yeuCau.body.dueDate || null,
    createdAt: new Date().toISOString(),
  };

  danhSachCongViec.push(congViecMoi);
  ghiDuLieu(danhSachCongViec);

  phanHoi.status(201).json(congViecMoi);
});

// Cap nhat cong viec
ungDung.put("/api/tasks/:id", (yeuCau, phanHoi) => {
  const danhSachCongViec = docDuLieu();
  const chiSo = danhSachCongViec.findIndex((cv) => cv.id === yeuCau.params.id);

  if (chiSo === -1) {
    return phanHoi.status(404).json({ message: "Khong tim thay cong viec." });
  }

  danhSachCongViec[chiSo] = {
    ...danhSachCongViec[chiSo],
    title: yeuCau.body.title ?? danhSachCongViec[chiSo].title,
    description: yeuCau.body.description ?? danhSachCongViec[chiSo].description,
    status: yeuCau.body.status ?? danhSachCongViec[chiSo].status,
    priority: yeuCau.body.priority ?? danhSachCongViec[chiSo].priority,
    dueDate: yeuCau.body.dueDate ?? danhSachCongViec[chiSo].dueDate,
  };

  ghiDuLieu(danhSachCongViec);
  phanHoi.json(danhSachCongViec[chiSo]);
});

// Xoa cong viec
ungDung.delete("/api/tasks/:id", (yeuCau, phanHoi) => {
  let danhSachCongViec = docDuLieu();
  const chiSo = danhSachCongViec.findIndex((cv) => cv.id === yeuCau.params.id);

  if (chiSo === -1) {
    return phanHoi.status(404).json({ message: "Khong tim thay cong viec." });
  }

  const congViecDaXoa = danhSachCongViec.splice(chiSo, 1)[0];
  ghiDuLieu(danhSachCongViec);
  phanHoi.json({ message: "Da xoa cong viec.", congViec: congViecDaXoa });
});

// === API voi PostgreSQL (khi co database) ===
ungDung.use("/api/users", tuyenDuongNguoiDung);
ungDung.use("/api/categories", tuyenDuongDanhMuc);
ungDung.use("/api/db-tasks", tuyenDuongCongViec);
ungDung.use("/api/notifications", tuyenDuongThongBao);

// Kiem tra suc khoe server
ungDung.get("/api/health", (yeuCau, phanHoi) => {
  phanHoi.json({
    trangThai: "ok",
    thongBao: "Server dang hoat dong.",
    thoiGian: new Date().toISOString(),
  });
});

// Xu ly loi middleware
ungDung.use((loi, yeuCau, phanHoi, tiepTheo) => {
  console.error("❌ Loi Server:", loi.message);
  phanHoi.status(loi.statusCode || 500).json({
    message: loi.message || "Loi he thong.",
  });
});

// Khoi dong server
async function khoiDongServer() {
  try {
    // Thu ket noi database (khong bat buoc)
    try {
      await khoiTaoDatabase();
      console.log("✅ Da ket noi PostgreSQL.");
    } catch (loiDB) {
      console.warn("⚠️ Khong ket noi duoc PostgreSQL, chi su dung file JSON:", loiDB.message);
    }

    ungDung.listen(CONG, () => {
      console.log(`🚀 Server dang chay tai http://localhost:${CONG}`);
      console.log(`📡 API: http://localhost:${CONG}/api`);
    });
  } catch (loi) {
    console.error("❌ Khong the khoi dong server:", loi.message);
    process.exit(1);
  }
}

khoiDongServer();