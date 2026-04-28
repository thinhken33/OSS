// ===== TRANG THAI UNG DUNG =====
const API = "/api";
let nguoiDungHienTai = null;
let danhSachCongViec = [];
let danhSachDanhMuc = [];
let tabHienTai = "all";

// ===== TIEN ICH =====
function layNgayHomNay() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];
}
function thoatHtml(t) { const d = document.createElement("div"); d.textContent = t || ""; return d.innerHTML; }
function $(id) { return document.getElementById(id); }

function hienToast(noiDung, loai = "") {
  const thung = $("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast " + loai;
  toast.textContent = noiDung;
  thung.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function goiAPI(duongDan, tuyChon = {}) {
  const res = await fetch(API + duongDan, {
    headers: { "Content-Type": "application/json" },
    ...tuyChon,
    body: tuyChon.body ? JSON.stringify(tuyChon.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Loi he thong");
  return data;
}

// ===== CHUYEN TRANG =====
function hienTrang(tenTrang) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  const trang = $("page" + tenTrang.charAt(0).toUpperCase() + tenTrang.slice(1));
  if (trang) trang.style.display = "block";
  document.querySelectorAll(".menu-item").forEach(m => {
    m.classList.toggle("active", m.dataset.page === tenTrang);
  });
}

// ===== DANG NHAP / DANG KY =====
function hienGiaoDienChinh() {
  $("trangDangNhap").style.display = "none";
  $("trangDangKy").style.display = "none";
  $("layoutChinh").style.display = "flex";
  capNhatThongTinNguoiDung();
  hienTrang("congViec");
  taiCongViec();
  taiDanhMuc();
}

function capNhatThongTinNguoiDung() {
  if (!nguoiDungHienTai) return;
  const chuCai = (nguoiDungHienTai.full_name || "U").charAt(0).toUpperCase();
  $("avatarSidebar").textContent = chuCai;
  $("tenNguoiDungSidebar").textContent = nguoiDungHienTai.full_name || "User";
  if (nguoiDungHienTai.role === "admin") $("menuAdmin").style.display = "block";
}

$("formDangNhap").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("loiDangNhap").textContent = "";
  try {
    const kq = await goiAPI("/users/login", {
      method: "POST",
      body: { email: $("dnEmail").value, password: $("dnMatKhau").value }
    });
    nguoiDungHienTai = kq.nguoiDung || kq.user;
    localStorage.setItem("nguoiDung", JSON.stringify(nguoiDungHienTai));
    hienGiaoDienChinh();
  } catch (loi) { $("loiDangNhap").textContent = loi.message; }
});

$("formDangKy").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("loiDangKy").textContent = "";
  if ($("dkMatKhau").value !== $("dkXacNhan").value) {
    $("loiDangKy").textContent = "Mat khau xac nhan khong khop.";
    return;
  }
  try {
    await goiAPI("/users/register", {
      method: "POST",
      body: { full_name: $("dkHoTen").value, email: $("dkEmail").value, password: $("dkMatKhau").value }
    });
    hienToast("Dang ky thanh cong! Hay dang nhap.", "success");
    $("trangDangKy").style.display = "none";
    $("trangDangNhap").style.display = "flex";
  } catch (loi) { $("loiDangKy").textContent = loi.message; }
});

$("nutMoDangKy").addEventListener("click", (e) => { e.preventDefault(); $("trangDangNhap").style.display = "none"; $("trangDangKy").style.display = "flex"; });
$("nutMoDangNhap").addEventListener("click", (e) => { e.preventDefault(); $("trangDangKy").style.display = "none"; $("trangDangNhap").style.display = "flex"; });
$("nutDangXuat").addEventListener("click", () => { nguoiDungHienTai = null; localStorage.removeItem("nguoiDung"); location.reload(); });

// ===== MENU SIDEBAR =====
document.querySelectorAll(".menu-item").forEach(nut => {
  nut.addEventListener("click", () => {
    const trang = nut.dataset.page;
    hienTrang(trang);
    if (trang === "thongBao") taiThongBao();
    if (trang === "thongKe") taiThongKe();
    if (trang === "caNhan") taiCaNhan();
    if (trang === "quanTri") taiQuanTri();
    if (trang === "danhMuc") taiVaHienDanhMuc();
  });
});

// ===== KHOI DONG =====
window.addEventListener("DOMContentLoaded", () => {
  const luu = localStorage.getItem("nguoiDung");
  if (luu) {
    try {
      nguoiDungHienTai = JSON.parse(luu);
      hienGiaoDienChinh();
    } catch { /* bo qua */ }
  }
});
