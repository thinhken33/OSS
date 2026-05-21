// ===== TRẠNG THÁI ỨNG DỤNG (APPLICATION STATE) =====
const API = "/api";
let nguoiDungHienTai = null;
let danhSachCongViec = [];
let danhSachDanhMuc = [];
let tabHienTai = "all";

// ===== CÁC HÀM TIỆN ÍCH (UTILITIES) =====
function layNgayHomNay() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

function thoatHtml(t) {
  if (!t) return "";
  return String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function $(id) {
  return document.getElementById(id);
}

function hienToast(noiDung, loai = "") {
  const thung = $("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast " + loai;
  toast.textContent = noiDung;
  thung.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function goiAPI(duongDan, tuyChon = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = "Bearer " + token;

  if (tuyChon.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(API + duongDan, {
    ...tuyChon,
    headers: { ...headers, ...(tuyChon.headers || {}) },
    body:
      tuyChon.body instanceof FormData
        ? tuyChon.body
        : tuyChon.body
          ? JSON.stringify(tuyChon.body)
          : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi hệ thống");
  return data;
}
