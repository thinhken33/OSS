// ===== TRẠNG THÁI ỨNG DỤNG (APPLICATION STATE) =====
// Biến lưu trữ trạng thái toàn cục của ứng dụng
const API = "/api";
let nguoiDungHienTai = null;
let danhSachCongViec = [];
let danhSachDanhMuc = [];
let tabHienTai = "all";

// ===== CÁC HÀM TIỆN ÍCH (UTILITIES) =====
// Các hàm hỗ trợ dùng chung trong toàn bộ ứng dụng
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
  if (!res.ok) throw new Error(data.message || "Lỗi hệ thống");
  return data;
}

// ===== XỬ LÝ CHUYỂN TRANG (NAVIGATION) =====
/**
 * Ẩn tất cả các trang và hiển thị trang được yêu cầu
 * @param {string} tenTrang Tên của trang cần hiển thị (ví dụ: 'congViec', 'thongBao')
 */
function hienTrang(tenTrang) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  const trang = $("page" + tenTrang.charAt(0).toUpperCase() + tenTrang.slice(1));
  if (trang) trang.style.display = "block";
  document.querySelectorAll(".menu-item").forEach(m => {
    m.classList.toggle("active", m.dataset.page === tenTrang);
  });
}

// ===== XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ (AUTHENTICATION) =====
/**
 * Chuyển đổi giao diện từ auth sang layout chính sau khi đăng nhập thành công
 */
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
    $("loiDangKy").textContent = "Mật khẩu xác nhận không khớp.";
    return;
  }
  try {
    await goiAPI("/users/register", {
      method: "POST",
      body: { full_name: $("dkHoTen").value, email: $("dkEmail").value, password: $("dkMatKhau").value }
    });
    hienToast("Đăng ký thanh cong! Hay dang nhap.", "success");
    $("trangDangKy").style.display = "none";
    $("trangDangNhap").style.display = "flex";
  } catch (loi) { $("loiDangKy").textContent = loi.message; }
});

$("nutMoDangKy").addEventListener("click", (e) => { e.preventDefault(); $("trangDangNhap").style.display = "none"; $("trangDangKy").style.display = "flex"; });
$("nutMoDangNhap").addEventListener("click", (e) => { e.preventDefault(); $("trangDangKy").style.display = "none"; $("trangDangNhap").style.display = "flex"; });
$("nutDangXuat").addEventListener("click", () => { nguoiDungHienTai = null; localStorage.removeItem("nguoiDung"); location.reload(); });

// ===== XỬ LÝ SỰ KIỆN MENU SIDEBAR =====
// Gắn sự kiện click cho các nút menu ở sidebar để chuyển đổi trang tương ứng
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

// ===== KHỞI ĐỘNG ỨNG DỤNG (INITIALIZATION) =====
// Hàm chạy khi DOM đã load xong, kiểm tra session đăng nhập trong localStorage
window.addEventListener("DOMContentLoaded", () => {
  const luu = localStorage.getItem("nguoiDung");
  if (luu) {
    try {
      nguoiDungHienTai = JSON.parse(luu);
      hienGiaoDienChinh();
    } catch { /* bo qua */ }
  }
});
// ===== QUẢN LÝ CÔNG VIỆC (TASK MANAGEMENT) =====
// Các hàm liên quan đến lấy, lọc, hiển thị và xử lý các thao tác trên công việc
function laQuaHan(cv) { return cv.status !== "completed" && cv.due_date && cv.due_date.split("T")[0] < layNgayHomNay(); }
function layTrangThai(cv) { if (cv.status === "completed") return "completed"; if (laQuaHan(cv)) return "overdue"; return cv.status; }
function nhanTrangThai(s) { return {"not-started":"Chưa bắt đầu","in-progress":"Đang làm","completed":"Hoàn thành","overdue":"Quá hạn"}[s] || s; }
function nhanUuTien(p) { return {low:"Thấp",medium:"Trung bình",high:"Cao"}[p] || p; }
function lopTrangThai(s) { return {"not-started":"gray","in-progress":"blue","completed":"green","overdue":"red"}[s]; }
function lopUuTien(p) { return {low:"gray",medium:"orange",high:"red"}[p]; }
function bieuTuong(s) { return {"not-started":{k:"◯",m:"#777"},"in-progress":{k:"▷",m:"#3b82f6"},"completed":{k:"✔",m:"#10b981"},"overdue":{k:"⚠",m:"#ef4444"}}[s]; }
function dinhDangNgay(d) { if(!d) return "Không có hạn"; const p=d.split("-"); return p[2]+"/"+p[1]+"/"+p[0]; }
function nhanNgay(cv) { if(!cv.due_date) return "Không có hạn"; const dStr = cv.due_date.split("T")[0]; if(dStr===layNgayHomNay()) return "Hôm nay"; return dinhDangNgay(dStr); }

async function taiCongViec() {
  try {
    if (!nguoiDungHienTai) return;
    const res = await fetch("/api/tasks/user/" + nguoiDungHienTai.user_id);
    if (!res.ok) throw new Error();
    danhSachCongViec = await res.json();
  } catch { danhSachCongViec = []; }
  hienThiCongViec();
}

function capNhatSoDem() {
  const dem = {all:danhSachCongViec.length,"not-started":0,"in-progress":0,completed:0,overdue:0};
  danhSachCongViec.forEach(cv => { dem[layTrangThai(cv)] = (dem[layTrangThai(cv)]||0)+1; });
  $("stat-total").textContent = dem.all + " tổng";
  $("stat-not-started").textContent = dem["not-started"] + " chưa bắt đầu";
  $("stat-in-progress").textContent = dem["in-progress"] + " đang làm";
  $("stat-completed").textContent = dem.completed + " xong";
  $("stat-overdue").textContent = dem.overdue + " quá hạn";
  document.querySelectorAll(".tab").forEach(t => { const k=t.dataset.tab; t.querySelector("span").textContent = dem[k]||0; });
}

function locCongViec() {
  const tk = ($("searchInput").value||"").trim().toLowerCase();
  const st = $("statusFilter").value;
  const pr = $("priorityFilter").value;
  return danhSachCongViec.filter(cv => {
    const tt = layTrangThai(cv);
    return (tabHienTai==="all"||tt===tabHienTai) &&
      (st==="all"||tt===st) && (pr==="all"||cv.priority===pr) &&
      (cv.title.toLowerCase().includes(tk)||(cv.description||"").toLowerCase().includes(tk));
  });
}

function hienThiCongViec() {
  const ds = locCongViec().sort((a,b) => new Date(a.due_date||"9999")-new Date(b.due_date||"9999"));
  const el = $("taskList");
  if (!ds.length) { el.innerHTML=""; $("emptyState").classList.add("show"); capNhatSoDem(); return; }
  $("emptyState").classList.remove("show");
  el.innerHTML = ds.map(cv => {
    const tt=layTrangThai(cv), bt=bieuTuong(tt), lngay=tt==="overdue"?"date red-text":"date";
    return `<article class="task-card ${tt==="overdue"?"overdue":""}">
      <div class="task-row"><div class="task-left">
        <div class="task-icon" style="color:${bt.m}">${bt.k}</div>
        <div class="task-content"><div class="task-title">${thoatHtml(cv.title)}</div>
          <div class="task-meta">
            <span class="pill ${lopTrangThai(tt)}">${nhanTrangThai(tt)}</span>
            <span class="pill ${lopUuTien(cv.priority)}">${nhanUuTien(cv.priority)}</span>
            <span class="${lngay}">📅 ${nhanNgay(cv)}</span>
            ${cv.category_name ? `<span class="pill purple">${thoatHtml(cv.category_name)}</span>` : ""}
          </div></div></div>
        <div class="task-actions"><div class="action-icons">
          <button class="action-btn edit-btn" data-id="${cv.task_id}">✎</button>
          <button class="action-btn delete-btn" data-id="${cv.task_id}">🗑</button>
        </div><button class="detail-link toggle-detail-btn">⌄ Chi tiết</button></div>
      </div><div class="task-detail">${thoatHtml(cv.description||"Không có mô tả.")}</div>
    </article>`;
  }).join("");
  capNhatSoDem();
}

// --- Modal thêm/sửa công việc ---
/**
 * Mở modal form để thêm mới hoặc chỉnh sửa công việc
 * @param {string} cheDo "add" (Thêm mới) hoặc "edit" (Chỉnh sửa)
 * @param {Object} cv Dữ liệu công việc nếu đang ở chế độ "edit"
 */
function moModalCongViec(cheDo, cv=null) {
  $("modalTitle").textContent = cheDo==="add"?"Thêm công việc":"Sửa công việc";
  const f=$("taskForm");
  if (cheDo==="add") { f.reset(); $("taskId").value=""; $("taskStatus").value="not-started"; $("taskPriority").value="medium"; $("taskDueDate").value=layNgayHomNay(); $("taskCategory").value=""; }
  else if (cv) { $("taskId").value=cv.task_id; $("taskTitle").value=cv.title; $("taskDescription").value=cv.description||""; $("taskStatus").value=cv.status; $("taskPriority").value=cv.priority; $("taskDueDate").value=cv.due_date?cv.due_date.split("T")[0]:""; $("taskCategory").value=cv.category_id||""; }
  capNhatSelectDanhMuc();
  $("modalBackdrop").classList.add("show");
}
function dongModal() { $("modalBackdrop").classList.remove("show"); $("taskForm").reset(); $("taskId").value=""; }

$("openAddModal").addEventListener("click", () => moModalCongViec("add"));
$("closeModal").addEventListener("click", dongModal);
$("cancelModal").addEventListener("click", dongModal);
$("modalBackdrop").addEventListener("click", e => { if(e.target===$("modalBackdrop")) dongModal(); });

$("taskForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id=$("taskId").value;
  const dl = { title:$("taskTitle").value.trim(), description:$("taskDescription").value.trim(),
    status:$("taskStatus").value, priority:$("taskPriority").value,
    due_date:$("taskDueDate").value, category_id:$("taskCategory").value };
  try {
    if (id) await fetch("/api/tasks/"+id+"/user/"+nguoiDungHienTai.user_id, {method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(dl)});
    else await fetch("/api/tasks/user/"+nguoiDungHienTai.user_id, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(dl)});
    dongModal(); await taiCongViec(); hienToast(id?"Đã cập nhật!":"Đã thêm!","success");
  } catch(l) { alert(l.message); }
});

$("searchInput").addEventListener("input", hienThiCongViec);
$("statusFilter").addEventListener("change", hienThiCongViec);
$("priorityFilter").addEventListener("change", hienThiCongViec);
$("toggleFilterBtn").addEventListener("click", () => $("filterPanel").classList.toggle("show"));
$("resetFilterBtn").addEventListener("click", () => {
  $("searchInput").value=""; $("statusFilter").value="all"; $("priorityFilter").value="all";
  tabHienTai="all"; document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.querySelector('[data-tab="all"]').classList.add("active"); hienThiCongViec();
});
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  t.classList.add("active"); tabHienTai=t.dataset.tab; hienThiCongViec();
}));

$("taskList").addEventListener("click", async e => {
  const nutSua=e.target.closest(".edit-btn"), nutXoa=e.target.closest(".delete-btn"), nutCT=e.target.closest(".toggle-detail-btn");
  if (nutSua) { const cv=danhSachCongViec.find(x=>String(x.task_id)===String(nutSua.dataset.id)); if(cv) moModalCongViec("edit",cv); }
  if (nutXoa) {
    const cv=danhSachCongViec.find(x=>String(x.task_id)===String(nutXoa.dataset.id)); if(!cv) return;
    if(!confirm('Xóa "'+cv.title+'"?')) return;
    try { await fetch("/api/tasks/"+cv.task_id+"/user/"+nguoiDungHienTai.user_id,{method:"DELETE"}); await taiCongViec(); hienToast("Đã xóa!","success"); } catch(l) { alert(l.message); }
  }
  if (nutCT) { const dt=nutCT.closest(".task-card").querySelector(".task-detail"); const mo=dt.classList.toggle("show"); nutCT.textContent=mo?"⌃ Chi tiết":"⌄ Chi tiết"; }
});
// ===== QUẢN LÝ DANH MỤC (CATEGORY MANAGEMENT) =====
// Các hàm xử lý việc tạo, sửa, xóa và hiển thị danh mục công việc của người dùng
async function taiDanhMuc() {
  try {
    if (!nguoiDungHienTai) return;
    const res = await fetch(API + "/categories/user/" + nguoiDungHienTai.user_id);
    if (res.ok) danhSachDanhMuc = await res.json();
  } catch { danhSachDanhMuc = []; }
}

function capNhatSelectDanhMuc() {
  const sel = $("taskCategory");
  if (!sel) return;
  const val = sel.value;
  sel.innerHTML = '<option value="">-- Không chọn --</option>';
  danhSachDanhMuc.forEach(dm => {
    sel.innerHTML += `<option value="${dm.category_id}">${thoatHtml(dm.name)}</option>`;
  });
  sel.value = val;
}

async function taiVaHienDanhMuc() {
  await taiDanhMuc();
  const el = $("danhSachDanhMuc");
  const rong = $("rongDanhMuc");
  if (!danhSachDanhMuc.length) { el.innerHTML = ""; rong.classList.add("show"); return; }
  rong.classList.remove("show");
  el.innerHTML = danhSachDanhMuc.map(dm => `
    <div class="dm-card">
      <span class="dm-card-name">🗂️ ${thoatHtml(dm.name)}</span>
      <div class="dm-card-actions">
        <button class="btn-sm btn-secondary" onclick="suaDanhMuc(${dm.category_id},'${thoatHtml(dm.name)}')">Sua</button>
        <button class="btn-sm btn-danger" onclick="xoaDanhMucUI(${dm.category_id})">Xoa</button>
      </div>
    </div>
  `).join("");
}

$("nutThemDanhMuc").addEventListener("click", () => { $("formThemDanhMuc").style.display = "flex"; $("tenDanhMucMoi").focus(); });
$("nutHủyDanhMuc").addEventListener("click", () => { $("formThemDanhMuc").style.display = "none"; $("tenDanhMucMoi").value = ""; });
$("nutLưuDanhMuc").addEventListener("click", async () => {
  const ten = $("tenDanhMucMoi").value.trim();
  if (!ten) return;
  try {
    await goiAPI("/categories/user/" + nguoiDungHienTai.user_id, { method: "POST", body: { name: ten } });
    $("tenDanhMucMoi").value = ""; $("formThemDanhMuc").style.display = "none";
    hienToast("Đã tạo danh mục!", "success"); await taiVaHienDanhMuc();
  } catch (l) { alert(l.message); }
});

async function suaDanhMuc(id, tenCu) {
  const tenMoi = prompt("Nhập tên mới:", tenCu);
  if (!tenMoi || !tenMoi.trim()) return;
  try {
    await goiAPI("/categories/" + id + "/user/" + nguoiDungHienTai.user_id, { method: "PUT", body: { name: tenMoi.trim() } });
    hienToast("Đã cập nhật!", "success"); await taiVaHienDanhMuc();
  } catch (l) { alert(l.message); }
}

async function xoaDanhMucUI(id) {
  if (!confirm("Xóa danh mục này?")) return;
  try {
    await goiAPI("/categories/" + id + "/user/" + nguoiDungHienTai.user_id, { method: "DELETE" });
    hienToast("Đã xóa!", "success"); await taiVaHienDanhMuc();
  } catch (l) { alert(l.message); }
}

// ===== QUẢN LÝ THÔNG BÁO (NOTIFICATION MANAGEMENT) =====
// Chức năng tải danh sách thông báo, đánh dấu đã đọc, xóa và tạo nhắc nhở
async function taiThongBao() {
  if (!nguoiDungHienTai) return;
  try {
    const ds = await goiAPI("/notifications/user/" + nguoiDungHienTai.user_id);
    const el = $("danhSachThongBao"), rong = $("rongThongBao");
    if (!ds.length) { el.innerHTML = ""; rong.classList.add("show"); return; }
    rong.classList.remove("show");
    el.innerHTML = ds.map(tb => `
      <div class="tb-card ${tb.is_read ? "" : "unread"}">
        <span class="tb-icon">${tb.is_read ? "📭" : "📬"}</span>
        <div class="tb-content">
          <div class="tb-message">${thoatHtml(tb.message)}</div>
          <div class="tb-time">${new Date(tb.created_at).toLocaleString("vi-VN")}</div>
        </div>
        <div class="tb-actions">
          ${!tb.is_read ? `<button class="btn-sm btn-secondary" onclick="docThongBao(${tb.notification_id})">Doc</button>` : ""}
          <button class="btn-sm btn-danger" onclick="xoaThongBaoUI(${tb.notification_id})">Xoa</button>
        </div>
      </div>
    `).join("");
    // Cap nhat badge
    const chuaDoc = ds.filter(t => !t.is_read).length;
    const badge = $("badgeThongBao");
    if (chuaDoc > 0) { badge.textContent = chuaDoc; badge.style.display = "inline"; }
    else { badge.style.display = "none"; }
  } catch { /* bo qua */ }
}

async function docThongBao(id) {
  try {
    await goiAPI("/notifications/" + id + "/user/" + nguoiDungHienTai.user_id + "/read", { method: "PATCH" });
    await taiThongBao();
  } catch (l) { alert(l.message); }
}

async function xoaThongBaoUI(id) {
  try {
    await goiAPI("/notifications/" + id + "/user/" + nguoiDungHienTai.user_id, { method: "DELETE" });
    hienToast("Đã xóa thông báo!", "success"); await taiThongBao();
  } catch (l) { alert(l.message); }
}

$("nutDocTatCa").addEventListener("click", async () => {
  if (!nguoiDungHienTai) return;
  try {
    await goiAPI("/notifications/user/" + nguoiDungHienTai.user_id + "/read-all", { method: "PATCH" });
    hienToast("Đã đọc tất cả!", "success"); await taiThongBao();
  } catch (l) { alert(l.message); }
});

$("nutTaoNhacViec").addEventListener("click", async () => {
  if (!nguoiDungHienTai) return;
  try {
    const kq = await goiAPI("/notifications/user/" + nguoiDungHienTai.user_id + "/reminders", { method: "POST" });
    hienToast(kq.message || "Đã tạo nhắc việc!", "success"); await taiThongBao();
  } catch (l) { alert(l.message); }
});

// ===== THỐNG KÊ (STATISTICS) =====
// Tính toán số liệu thống kê (tổng, chưa bắt đầu, đang làm, v.v.) và vẽ biểu đồ trạng thái
async function taiThongKe() {
  const dem = { tong: danhSachCongViec.length, chuaBatDau: 0, dangLam: 0, hoanThanh: 0, quaHan: 0 };
  danhSachCongViec.forEach(cv => {
    const tt = layTrangThai(cv);
    if (tt === "not-started") dem.chuaBatDau++;
    else if (tt === "in-progress") dem.dangLam++;
    else if (tt === "completed") dem.hoanThanh++;
    else if (tt === "overdue") dem.quaHan++;
  });
  $("tkTong").textContent = dem.tong;
  $("tkChuaBatDau").textContent = dem.chuaBatDau;
  $("tkDangLam").textContent = dem.dangLam;
  $("tkHoanThanh").textContent = dem.hoanThanh;
  $("tkQuaHan").textContent = dem.quaHan;
  $("tkTiLe").textContent = dem.tong ? Math.round(dem.hoanThanh / dem.tong * 100) + "%" : "0%";

  // Bieu do
  const max = Math.max(dem.chuaBatDau, dem.dangLam, dem.hoanThanh, dem.quaHan, 1);
  $("bieuDoThongKe").innerHTML = [
    { nhan: "Chưa bắt đầu", so: dem.chuaBatDau, lop: "gray" },
    { nhan: "Đang làm", so: dem.dangLam, lop: "orange" },
    { nhan: "Hoàn thành", so: dem.hoanThanh, lop: "green" },
    { nhan: "Quá hạn", so: dem.quaHan, lop: "red" },
  ].map(d => `
    <div class="chart-bar-row">
      <div class="chart-bar-label">${d.nhan}</div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill ${d.lop}" style="width:${Math.max(d.so/max*100,d.so?8:0)}%">${d.so}</div>
      </div>
    </div>
  `).join("");
}

// ===== THÔNG TIN CÁ NHÂN (USER PROFILE) =====
// Xem, sửa thông tin người dùng hiện tại và đổi mật khẩu
function taiCaNhan() {
  if (!nguoiDungHienTai) return;
  $("cnHoTen").value = nguoiDungHienTai.full_name || "";
  $("cnEmail").value = nguoiDungHienTai.email || "";
  $("cnMoTa").value = nguoiDungHienTai.bio || "";
  $("avatarCaNhan").textContent = (nguoiDungHienTai.full_name || "U").charAt(0).toUpperCase();
}

$("formCaNhan").addEventListener("submit", async e => {
  e.preventDefault();
  $("loiCaNhan").textContent = "";
  try {
    const kq = await goiAPI("/users/" + nguoiDungHienTai.user_id, {
      method: "PUT", body: { full_name: $("cnHoTen").value, bio: $("cnMoTa").value }
    });
    nguoiDungHienTai = kq.nguoiDung || kq.user || { ...nguoiDungHienTai, full_name: $("cnHoTen").value };
    localStorage.setItem("nguoiDung", JSON.stringify(nguoiDungHienTai));
    capNhatThongTinNguoiDung();
    hienToast("Đã cập nhật thông tin!", "success");
  } catch (l) { $("loiCaNhan").textContent = l.message; }
});

$("formDoiMatKhau").addEventListener("submit", async e => {
  e.preventDefault();
  $("loiDoiMK").textContent = "";
  if ($("mkMoi").value !== $("mkXacNhan").value) { $("loiDoiMK").textContent = "Mật khẩu xác nhận không khớp."; return; }
  try {
    await goiAPI("/users/" + nguoiDungHienTai.user_id + "/password", {
      method: "PUT", body: { current_password: $("mkHienTai").value, new_password: $("mkMoi").value }
    });
    hienToast("Đổi mật khẩu thanh cong!", "success");
    $("formDoiMatKhau").reset();
  } catch (l) { $("loiDoiMK").textContent = l.message; }
});

// ===== CHỨC NĂNG QUẢN TRỊ (ADMIN PANEL) =====
// Chỉ hiển thị đối với tài khoản có role="admin". Cho phép xem danh sách và khóa/mở khóa tài khoản.
async function taiQuanTri() {
  if (!nguoiDungHienTai || nguoiDungHienTai.role !== "admin") return;
  try {
    const ds = await goiAPI("/users");
    $("danhSachNguoiDung").innerHTML = ds.map(nd => `
      <tr>
        <td>${nd.user_id}</td>
        <td>${thoatHtml(nd.full_name)}</td>
        <td>${thoatHtml(nd.email)}</td>
        <td><span class="pill ${nd.role==="admin"?"blue":"gray"}">${nd.role}</span></td>
        <td><span class="pill ${nd.is_locked?"red":"green"}">${nd.is_locked?"Đã khóa":"Hoạt động"}</span></td>
        <td>
          ${nd.user_id !== nguoiDungHienTai.user_id ? `
            <button class="btn-sm ${nd.is_locked?"btn-success":"btn-danger"}" onclick="khoaMoKhoa(${nd.user_id},${!nd.is_locked})">
              ${nd.is_locked?"Mở khóa":"Khóa"}
            </button>
          ` : "<em>Ban</em>"}
        </td>
      </tr>
    `).join("");
  } catch (l) { alert(l.message); }
}

async function khoaMoKhoa(id, khoa) {
  try {
    await goiAPI("/users/" + id + "/lock", { method: "PATCH", body: { is_locked: khoa } });
    hienToast(khoa ? "Đã khóa tài khoản!" : "Đã mở khóa!", "success");
    await taiQuanTri();
  } catch (l) { alert(l.message); }
}
