// ===== TRẠNG THÁI ỨNG DỤNG (APPLICATION STATE) =====
const API = "/api";
let nguoiDungHienTai = null;
let accessToken = null;
let danhSachCongViec = [];
let danhSachDanhMuc = [];
let tabHienTai = "all";

// ===== CÁC HÀM TIỆN ÍCH (UTILITIES) =====
function layNgayHomNay() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];
}

// ===== CUSTOM DATE-TIME PICKER ENGINE =====
// Mỗi instance DTP quản lý 1 bộ chọn ngày giờ
function taoDateTimePicker(config) {
  // config: { displayId, valId, panelId, hiddenId, allowPast, defaultValue }
  const state = { year: 0, month: 0, selectedDt: null };
  const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const MONTHS = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const pad = n => String(n).padStart(2, "0");

  function hienThiPanel() {
    const panel = $(config.panelId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const firstDay = new Date(state.year, state.month, 1);
    const lastDay = new Date(state.year, state.month + 1, 0);
    const startDow = firstDay.getDay(); // 0=CN
    const selD = state.selectedDt;

    // Xây dựng lưới lịch
    let cells = "";
    DAYS.forEach(d => { cells += `<div class="dtp-dow">${d}</div>`; });
    for (let i = 0; i < startDow; i++) cells += `<button class="dtp-day other-month" disabled></button>`;
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const thisDt = new Date(state.year, state.month, d);
      const isPast = !config.allowPast && thisDt < today;
      const isToday = thisDt.getTime() === today.getTime();
      const isSel = selD && thisDt.getFullYear() === selD.getFullYear() && thisDt.getMonth() === selD.getMonth() && thisDt.getDate() === selD.getDate();
      const cls = ["dtp-day", isToday ? "today" : "", isSel ? "selected" : ""].filter(Boolean).join(" ");
      cells += `<button class="${cls}" data-d="${d}" ${isPast ? "disabled" : ""}>` + d + `</button>`;
    }

    const curH = selD ? selD.getHours() : 23;
    const curM = selD ? selD.getMinutes() : 59;
    const panId = config.panelId;

    panel.innerHTML = `
      <div class="dtp-cal-head">
        <button type="button" class="dtp-nav" data-nav="-1">&#8249;</button>
        <span>${MONTHS[state.month]} ${state.year}</span>
        <button type="button" class="dtp-nav" data-nav="1">&#8250;</button>
      </div>
      <div class="dtp-cal-grid">${cells}</div>
      <div class="dtp-time-block">
        <div class="dtp-time-title">Chọn giờ</div>
        <div class="dtp-time-row">
          <div class="dtp-time-col">
            <div class="dtp-time-col-label">Giờ</div>
            <input class="dtp-time-num" type="text" inputmode="numeric" id="${panId}_h" value="${pad(curH)}" maxlength="2" />
          </div>
          <span class="dtp-time-sep">:</span>
          <div class="dtp-time-col">
            <div class="dtp-time-col-label">Phút</div>
            <input class="dtp-time-num" type="text" inputmode="numeric" id="${panId}_m" value="${pad(curM)}" maxlength="2" />
          </div>
        </div>
        <div id="${panId}_err" class="dtp-time-err"></div>
      </div>
      <div class="dtp-actions">
        <button type="button" class="dtp-btn-clear" data-clear>Xóa</button>
        <button type="button" class="dtp-btn-ok" data-ok>Xác nhận</button>
      </div>`;

    // Helper lấy giá trị giờ/phút từ input và báo lỗi
    function layH() {
      let v = parseInt($(panId + "_h").value);
      return (isNaN(v) || v < 0 || v > 23) ? -1 : v;
    }
    function layM() {
      let v = parseInt($(panId + "_m").value);
      return (isNaN(v) || v < 0 || v > 59) ? -1 : v;
    }

    function checkValid() {
      let err = [];
      const hInput = $(panId + "_h");
      const mInput = $(panId + "_m");
      if (layH() === -1) { err.push("Giờ (0-23)"); hInput.classList.add("invalid"); }
      else { hInput.classList.remove("invalid"); }
      if (layM() === -1) { err.push("Phút (0-59)"); mInput.classList.add("invalid"); }
      else { mInput.classList.remove("invalid"); }
      $(panId + "_err").textContent = err.length ? "Sai: " + err.join(", ") : "";
      return err.length === 0;
    }

    // Xác thực input khi người dùng nhập tay
    const hInput = $(panId + "_h");
    const mInput = $(panId + "_m");

    // Chặn nhập chữ
    hInput.addEventListener("input", function () { this.value = this.value.replace(/[^0-9]/g, ""); checkValid(); });
    mInput.addEventListener("input", function () { this.value = this.value.replace(/[^0-9]/g, ""); checkValid(); });

    // Tự động bôi đen (select) khi click/focus để dễ gõ đè
    hInput.addEventListener("focus", function () { this.select(); });
    mInput.addEventListener("focus", function () { this.select(); });

    // Format khi kết thúc nhập (xóa trống -> mặc định 00, thêm số 0)
    function formatInput(input, isHour) {
      let v = parseInt(input.value);
      if (isNaN(v)) {
        input.value = "00";
      } else if (v >= 0 && v <= (isHour ? 23 : 59)) {
        input.value = pad(v);
      }
      checkValid();
    }

    hInput.addEventListener("blur", function () { formatInput(this, true); });
    mInput.addEventListener("blur", function () { formatInput(this, false); });
    hInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); formatInput(this, true); } });
    mInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); formatInput(this, false); } });

    // Sự kiện trong panel — chọn ngày
    panel.querySelectorAll(".dtp-nav").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        if (!checkValid()) return;
        // Cập nhật giờ/phút trước khi re-render
        if (state.selectedDt) state.selectedDt.setHours(layH(), layM(), 0, 0);
        else { const d = new Date(); state.selectedDt = new Date(state.year, state.month, d.getDate(), layH(), layM()); }
        state.month += parseInt(btn.dataset.nav);
        if (state.month < 0) { state.month = 11; state.year--; }
        if (state.month > 11) { state.month = 0; state.year++; }
        hienThiPanel();
      });
    });
    panel.querySelectorAll(".dtp-day:not(:disabled)").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        if (!checkValid()) return;
        const d = parseInt(btn.dataset.d);
        state.selectedDt = new Date(state.year, state.month, d, layH(), layM(), 0);
        hienThiPanel();
      });
    });
    panel.querySelector("[data-ok]").addEventListener("click", e => {
      e.stopPropagation();
      if (!checkValid()) return;
      if (!state.selectedDt) {
        state.selectedDt = new Date(state.year, state.month, new Date().getDate(), layH(), layM(), 0);
      } else {
        state.selectedDt.setHours(layH(), layM(), 0, 0);
      }
      // Nếu không cho phép quá khứ, kiểm tra thời điểm đã chọn
      if (!config.allowPast && state.selectedDt <= new Date()) {
        hienToast("⚠️ Hạn hoàn thành phải là thời điểm trong tương lai!", "error");
        return;
      }
      dongPicker(); capNhatGiaTri();
    });
    panel.querySelector("[data-clear]").addEventListener("click", e => {
      e.stopPropagation();
      state.selectedDt = null;
      capNhatGiaTri(); dongPicker();
    });
  }

  function moPanel() {
    const panel = $(config.panelId);
    const disp = $(config.displayId);
    // Đóng tất cả panel khác trước
    document.querySelectorAll(".dtp-panel.open").forEach(p => { if (p.id !== config.panelId) p.classList.remove("open"); });
    document.querySelectorAll(".dtp-display.open").forEach(d => { if (d.id !== config.displayId) d.classList.remove("open"); });
    const now = state.selectedDt || new Date();
    state.year = now.getFullYear();
    state.month = now.getMonth();
    hienThiPanel();
    panel.classList.add("open");
    disp.classList.add("open");
  }

  function dongPicker() {
    $(config.panelId).classList.remove("open");
    $(config.displayId).classList.remove("open");
  }

  function capNhatGiaTri() {
    const valEl = $(config.valId);
    const hiddenEl = $(config.hiddenId);
    if (state.selectedDt) {
      const y = state.selectedDt.getFullYear(), mo = state.selectedDt.getMonth() + 1, d = state.selectedDt.getDate();
      const h = state.selectedDt.getHours(), m = state.selectedDt.getMinutes();
      valEl.innerHTML = `<strong>${pad(d)}/${pad(mo)}/${y}</strong>&nbsp;&nbsp;Lúc ${pad(h)}:${pad(m)}`;
      hiddenEl.value = `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(m)}`;
    } else {
      valEl.innerHTML = `<span class="dtp-placeholder">${config.placeholder || "Chưa chọn"}</span>`;
      hiddenEl.value = "";
    }
    if (config.onChange) config.onChange(state.selectedDt);
  }

  function datGiaTri(isoStr) {
    if (!isoStr) { state.selectedDt = null; capNhatGiaTri(); return; }
    const d = new Date(isoStr);
    if (!isNaN(d)) { state.selectedDt = d; capNhatGiaTri(); }
  }

  // Gắn sự kiện
  const display = $(config.displayId);
  const panelEl = $(config.panelId);
  display.addEventListener("click", e => { e.stopPropagation(); moPanel(); });
  display.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); moPanel(); } });
  panelEl.addEventListener("click", e => e.stopPropagation());

  return { datGiaTri, dongPicker, layGiaTri: () => state.selectedDt };
}

// Khởi tạo 2 picker cho modal
let dtpStart = null, dtpDue = null;

function khoiTaoPicker() {
  if (dtpStart) return; // chỉ khởi tạo 1 lần
  dtpStart = taoDateTimePicker({
    displayId: "dtpStartDisplay", valId: "dtpStartVal",
    panelId: "dtpStartPanel", hiddenId: "taskStartDate",
    allowPast: true, placeholder: "Chưa chọn"
  });
  dtpDue = taoDateTimePicker({
    displayId: "dtpDueDisplay", valId: "dtpDueVal",
    panelId: "dtpDuePanel", hiddenId: "taskDueDate",
    allowPast: false, placeholder: "Bắt buộc chọn"
  });
  // Đóng picker khi click ngoài
  document.addEventListener("click", () => {
    document.querySelectorAll(".dtp-panel.open").forEach(p => p.classList.remove("open"));
    document.querySelectorAll(".dtp-display.open").forEach(d => d.classList.remove("open"));
  });
}
function thoatHtml(t) { const d = document.createElement("div"); d.textContent = t || ""; return d.innerHTML; }
function $(id) { return document.getElementById(id); }

function ganThongBaoValidationTiengViet() {
  const cacTruong = document.querySelectorAll("input, select, textarea");

  const datThongBao = (el) => {
    const v = el.validity;
    if (v.valueMissing) {
      el.setCustomValidity("Vui lòng điền vào trường này.");
    } else if (v.typeMismatch) {
      if (el.type === "email") el.setCustomValidity("Vui lòng nhập đúng định dạng email.");
      else el.setCustomValidity("Giá trị nhập vào chưa đúng định dạng.");
    } else if (v.tooShort) {
      el.setCustomValidity(`Vui lòng nhập ít nhất ${el.minLength} ký tự.`);
    } else if (v.patternMismatch) {
      el.setCustomValidity("Giá trị nhập vào chưa đúng định dạng yêu cầu.");
    } else {
      el.setCustomValidity("");
    }
  };

  cacTruong.forEach((el) => {
    el.addEventListener("invalid", () => datThongBao(el));
    el.addEventListener("input", () => el.setCustomValidity(""));
    el.addEventListener("change", () => el.setCustomValidity(""));
  });
}

function hienToast(noiDung, loai = "") {
  const thung = $("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast " + loai;
  toast.textContent = noiDung;
  thung.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function luuDuLieuDangNhap(nguoiDung, token) {
  nguoiDungHienTai = nguoiDung || null;
  accessToken = token || null;

  if (nguoiDungHienTai) {
    localStorage.setItem("nguoiDung", JSON.stringify(nguoiDungHienTai));
  } else {
    localStorage.removeItem("nguoiDung");
  }

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  } else {
    localStorage.removeItem("accessToken");
  }
}

function xoaDuLieuDangNhap() {
  nguoiDungHienTai = null;
  accessToken = null;
  localStorage.removeItem("nguoiDung");
  localStorage.removeItem("accessToken");
}

async function goiAPI(duongDan, tuyChon = {}) {
  const headers = { ...(tuyChon.headers || {}) };
  const coBody = typeof tuyChon.body !== "undefined";
  const laFormData = typeof FormData !== "undefined" && tuyChon.body instanceof FormData;

  const daCoContentType = Object.keys(headers).some(
    (tenHeader) => tenHeader.toLowerCase() === "content-type",
  );

  if (coBody && !laFormData && !daCoContentType) {
    headers["Content-Type"] = "application/json";
  }

  const tokenDangNhap = accessToken || localStorage.getItem("accessToken");
  if (tokenDangNhap) {
    headers.Authorization = `Bearer ${tokenDangNhap}`;
  }

  const res = await fetch(API + duongDan, {
    ...tuyChon,
    headers,
    body: coBody ? (laFormData ? tuyChon.body : JSON.stringify(tuyChon.body)) : undefined,
  });
  const noiDung = await res.text();
  let data = {};

  if (noiDung) {
    try {
      data = JSON.parse(noiDung);
    } catch {
      if (!res.ok) {
        throw new Error(`API ${res.status}: ${res.statusText}`);
      }
      return { raw: noiDung };
    }
  }

  if (!res.ok) {
    if (
      res.status === 401
      && !duongDan.startsWith("/users/login")
      && !duongDan.startsWith("/users/register")
    ) {
      xoaDuLieuDangNhap();
      hienTrangAuth("login");
    }
    throw new Error(data.message || `API ${res.status}: ${res.statusText}`);
  }

  return data;
}

// ===== XỬ LÝ CHUYỂN TRANG (NAVIGATION) =====
function hienTrang(tenTrang) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  const trang = $("page" + tenTrang.charAt(0).toUpperCase() + tenTrang.slice(1));
  if (trang) trang.style.display = "block";
  document.querySelectorAll(".menu-item[data-page]").forEach(m => {
    m.classList.toggle("active", m.dataset.page === tenTrang);
  });
}

function hienTrangAuth(loai) {
  $("trangChu").style.display = "none";
  $("trangDangNhap").style.display = "none";
  $("trangDangKy").style.display = "none";
  $("layoutChinh").style.display = "none";

  if (loai === "landing") $("trangChu").style.display = "block";
  else if (loai === "login") $("trangDangNhap").style.display = "flex";
  else if (loai === "register") $("trangDangKy").style.display = "flex";
  else if (loai === "app") {
    $("layoutChinh").style.display = "flex";
    capNhatThongTinNguoiDung();
    hienTrang("congViec");
    taiCongViec();
    taiDanhMuc();
    taiThongBao();
  }
}

// ===== XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ (AUTHENTICATION) =====
function capNhatThongTinNguoiDung() {
  if (!nguoiDungHienTai) return;
  const chuCai = (nguoiDungHienTai.full_name || "U").charAt(0).toUpperCase();
  const avatarSidebar = $("avatarSidebar");
  
  // Hiển thị avatar ảnh nếu có, nếu không hiển thị chữ cái
  if (nguoiDungHienTai.avatar_url) {
    avatarSidebar.style.backgroundImage = `url(${nguoiDungHienTai.avatar_url})`;
    avatarSidebar.style.backgroundSize = "cover";
    avatarSidebar.style.backgroundPosition = "center";
    avatarSidebar.textContent = "";
  } else {
    avatarSidebar.style.backgroundImage = "none";
    avatarSidebar.textContent = chuCai;
  }
  
  $("tenNguoiDungSidebar").textContent = nguoiDungHienTai.full_name || "User";
  if (nguoiDungHienTai.role === "admin") $("menuAdmin").style.display = "block";
}

// Landing page buttons
$("nutDiDangNhap")?.addEventListener("click", () => hienTrangAuth("login"));
$("nutDiDangKy")?.addEventListener("click", () => hienTrangAuth("register"));
$("nutBatDauNgay")?.addEventListener("click", () => hienTrangAuth("register"));
$("nutVeTrangChu")?.addEventListener("click", (e) => { e.preventDefault(); hienTrangAuth("landing"); });
$("nutVeTrangChu2")?.addEventListener("click", (e) => { e.preventDefault(); hienTrangAuth("landing"); });
$("nutMoDangKy")?.addEventListener("click", (e) => { e.preventDefault(); hienTrangAuth("register"); });
$("nutMoDangNhap")?.addEventListener("click", (e) => { e.preventDefault(); hienTrangAuth("login"); });
$("nutQuenMatKhau")?.addEventListener("click", (e) => { e.preventDefault(); alert("Vui lòng liên hệ quản trị viên để cấp lại mật khẩu!"); });

$("formDangNhap").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("loiDangNhap").textContent = "";
  try {
    const kq = await goiAPI("/users/login", {
      method: "POST",
      body: { email: $("dnEmail").value, password: $("dnMatKhau").value }
    });
    const userDangNhap = kq.nguoiDung || kq.user || null;
    const tokenDangNhap = kq.accessToken || kq.token || null;
    if (!userDangNhap) {
      throw new Error("Đăng nhập thất bại. Máy chủ chưa trả thông tin người dùng.");
    }
    if (!tokenDangNhap) {
      throw new Error("Đăng nhập thất bại. Máy chủ chưa trả token phiên đăng nhập, vui lòng khởi động lại backend.");
    }
    luuDuLieuDangNhap(userDangNhap, tokenDangNhap);
    hienTrangAuth("app");
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
    hienToast("Đăng ký thành công! Hãy đăng nhập.", "success");
    hienTrangAuth("login");
  } catch (loi) { $("loiDangKy").textContent = loi.message; }
});

$("nutDangXuat").addEventListener("click", () => {
  xoaDuLieuDangNhap();
  location.reload();
});

// ===== XỬ LÝ SỰ KIỆN MENU SIDEBAR =====
document.querySelectorAll(".menu-item[data-page]").forEach(nut => {
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

// ===== KHỞI ĐỘNG ỨNG DỤNG =====
window.addEventListener("DOMContentLoaded", () => {
  ganThongBaoValidationTiengViet();
  const luuNguoiDung = localStorage.getItem("nguoiDung");
  const luuToken = localStorage.getItem("accessToken");
  if (luuNguoiDung && luuToken) {
    try {
      nguoiDungHienTai = JSON.parse(luuNguoiDung);
      accessToken = luuToken;
      hienTrangAuth("app");
    } catch {
      xoaDuLieuDangNhap();
      hienTrangAuth("landing");
    }
  } else {
    xoaDuLieuDangNhap();
    hienTrangAuth("landing");
  }
});

// ===== QUẢN LÝ CÔNG VIỆC (TASK MANAGEMENT) =====
// Status mapping: Frontend (not-started, in-progress) <-> Backend (pending, in_progress)
function statusToFE(beStatus) {
  if (beStatus === "pending") return "not-started";
  if (beStatus === "in_progress") return "in-progress";
  return beStatus;
}
function statusToBE(feStatus) {
  if (feStatus === "not-started") return "pending";
  if (feStatus === "in-progress") return "in_progress";
  return feStatus;
}

// Kiểm tra quá hạn bằng cách so sánh timestamp thực — đúng với mọi múi giờ
function laQuaHan(cv) { return cv.status !== "completed" && cv.due_date && new Date(cv.due_date) < new Date(); }
function layTrangThaiFE(cv) {
  if (cv.status === "completed") return "completed";
  if (laQuaHan(cv)) return "overdue";
  if (cv.start_date && new Date(cv.start_date) <= new Date()) return "in-progress";
  return "not-started";
}
function nhanTrangThai(s) { return { "not-started": "Chưa bắt đầu", "in-progress": "Đang làm", "completed": "Hoàn thành", "overdue": "Quá hạn" }[s] || s; }
function nhanUuTien(p) { return { low: "Thấp", medium: "Trung bình", high: "Cao" }[p] || p; }
function lopTrangThai(s) { return { "not-started": "gray", "in-progress": "blue", "completed": "green", "overdue": "red" }[s]; }
function lopUuTien(p) { return { low: "gray", medium: "orange", high: "red" }[p]; }
function bieuTuong(s) { return { "not-started": { k: "O", m: "#777" }, "in-progress": { k: ">", m: "#3b82f6" }, "completed": { k: "V", m: "#10b981" }, "overdue": { k: "!", m: "#ef4444" } }[s]; }

function boDauTiengViet(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const DANH_SACH_ICON_DANH_MUC = [
  "\u{1F4C1}", // folder
  "\u{1F4DA}", // books
  "\u{1F464}", // person
  "\u{1F465}", // people
  "\u{1F4BC}", // briefcase
  "\u{1F6D2}", // cart
  "\u{1F3E5}", // hospital
  "\u{1F4A1}", // idea
];

function chuanHoaIconDanhMuc(icon) {
  const giaTri = (icon || "").trim();
  if (!giaTri) return DANH_SACH_ICON_DANH_MUC[0];
  if (DANH_SACH_ICON_DANH_MUC.includes(giaTri)) return giaTri;
  return DANH_SACH_ICON_DANH_MUC[0];
}

function chonIconCongViec(cv) {
  const tt = layTrangThaiFE(cv);
  if (tt === "overdue") return "\u23F0"; // alarm clock
  if (tt === "completed") return "\u2705"; // check mark
  if (cv.priority === "high") return "\u{1F525}"; // fire

  const noiDung = boDauTiengViet(`${cv.title || ""} ${cv.description || ""}`);
  const boIcon = [
    { keys: ["hoc", "on thi", "bai tap", "study", "lop"], icon: "\u{1F4DA}" }, // books
    { keys: ["hop", "meeting", "nhom", "team"], icon: "\u{1F91D}" }, // handshake
    { keys: ["mua", "shop", "sieu thi", "don hang"], icon: "\u{1F6D2}" }, // cart
    { keys: ["suc khoe", "tap gym", "chay bo", "kham"], icon: "\u{1FA7A}" }, // stethoscope
    { keys: ["goi", "call", "khach hang", "client"], icon: "\u260E\uFE0F" }, // phone
    { keys: ["code", "dev", "fix", "bug", "deploy"], icon: "\u{1F4BB}" }, // laptop
    { keys: ["du lich", "travel", "ve may bay"], icon: "\u2708\uFE0F" }, // airplane
    { keys: ["tai chinh", "hoa don", "thu chi"], icon: "\u{1F4B0}" }, // money bag
  ];

  for (const item of boIcon) {
    if (item.keys.some(k => noiDung.includes(k))) return item.icon;
  }

  const fallback = ["\u{1F4CC}", "\u{1F31F}", "\u{1F680}", "\u{1F4A1}", "\u{1F3AF}", "\u{1F389}"];
  const idx = Math.abs((cv.task_id || 0) % fallback.length);
  return fallback[idx];
}

function chonIconDanhMuc(dm) {
  if (dm?.icon && dm.icon.trim()) {
    return chuanHoaIconDanhMuc(dm.icon);
  }
  const ten = boDauTiengViet(dm?.name || "");
  if (ten.includes("hoc")) return "\u{1F4DA}";
  if (ten.includes("ca nhan")) return "\u{1F464}";
  if (ten.includes("nhom") || ten.includes("team")) return "\u{1F465}";
  if (ten.includes("cong viec")) return "\u{1F4BC}";
  if (ten.includes("suc khoe")) return "\u{1FA7A}";
  if (ten.includes("mua sam") || ten.includes("shop")) return "\u{1F6D2}";
  const fallback = ["\u{1F4C1}", "\u{1F5C2}\uFE0F", "\u{1F4D2}", "\u{1F4D8}"];
  return fallback[Math.abs((dm?.category_id || 0) % fallback.length)];
}

// Định dạng ngày giờ đầy đủ theo locale Việt Nam
function dinhDangNgay(d) {
  if (!d) return "Không có hạn";
  return new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function nhanNgay(cv) {
  if (!cv.due_date) return "Không có hạn";
  const han = new Date(cv.due_date);
  const homNay = new Date();
  if (han.toDateString() === homNay.toDateString()) return "Hom nay luc " + han.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return dinhDangNgay(cv.due_date);
}

async function taiCongViec() {
  try {
    if (!nguoiDungHienTai) return;
    danhSachCongViec = await goiAPI("/tasks/user/" + nguoiDungHienTai.user_id);

    // Auto-Escalation Logic
    const now = new Date();
    for (let cv of danhSachCongViec) {
      if (cv.status !== 'completed' && layTrangThaiFE(cv) !== 'not-started' && cv.priority !== 'high' && cv.due_date) {
        const due = new Date(cv.due_date);
        const diffHours = (due - now) / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= 12) {
          cv.priority = 'high';
          try {
            await goiAPI(`/tasks/${cv.task_id}/user/${nguoiDungHienTai.user_id}`, {
              method: "PUT",
              body: {
                title: cv.title,
                description: cv.description || "",
                start_date: cv.start_date || null,
                due_date: cv.due_date || null,
                priority: "high",
                status: cv.status,
                reminder_minutes: cv.reminder_minutes ?? 0,
                category_id: cv.category_id || null,
              },
            });
          } catch { }
          hienToast(`"${cv.title}" đã được nâng ưu tiên CAO vì sắp đến hạn!`, "warning");
        }
      }
    }
  } catch { danhSachCongViec = []; }
  hienThiCongViec();
}

function capNhatSoDem() {
  const dem = { all: danhSachCongViec.length, "not-started": 0, "in-progress": 0, completed: 0, overdue: 0 };
  danhSachCongViec.forEach(cv => { dem[layTrangThaiFE(cv)] = (dem[layTrangThaiFE(cv)] || 0) + 1; });
  document.querySelectorAll(".tab").forEach(t => { const k = t.dataset.tab; t.querySelector("span").textContent = dem[k] || 0; });
  capNhatDashboardCongViec();
}

function laCungNgay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function taoDuLieuDashboardCongViec() {
  const duLieu = {
    tong: danhSachCongViec.length,
    quaHan: 0,
    deadlineHomNay: 0,
    dangLam: 0,
    chuaBatDau: 0,
    hoanThanh: 0
  };
  const now = new Date();

  danhSachCongViec.forEach(cv => {
    const tt = layTrangThaiFE(cv);
    if (tt === "overdue") duLieu.quaHan++;
    if (tt === "in-progress") duLieu.dangLam++;
    if (tt === "not-started") duLieu.chuaBatDau++;
    if (tt === "completed") duLieu.hoanThanh++;

    if (cv.due_date) {
      const han = new Date(cv.due_date);
      if (tt !== "completed" && !Number.isNaN(han.getTime()) && laCungNgay(han, now)) {
        duLieu.deadlineHomNay++;
      }
    }
  });

  return duLieu;
}

function capNhatDashboardCongViec() {
  const donut = $("taskDonutChart");
  const donutCenter = $("taskDonutCenter");
  const donutLegend = $("taskDonutLegend");
  const statusBars = $("taskStatusBars");
  const progressRing = $("taskProgressRing");
  const progressValue = $("taskProgressValue");
  const progressNote = $("taskProgressNote");
  if (!donut || !donutCenter || !donutLegend || !statusBars || !progressRing || !progressValue || !progressNote) return;

  const duLieu = taoDuLieuDashboardCongViec();
  $("dbTongCongViec").textContent = duLieu.tong;
  $("dbQuaHan").textContent = duLieu.quaHan;
  $("dbDeadlineHomNay").textContent = duLieu.deadlineHomNay;
  $("dbDangLam").textContent = duLieu.dangLam;
  $("dbChuaBatDau").textContent = duLieu.chuaBatDau;
  $("dbHoanThanh").textContent = duLieu.hoanThanh;

  const trangThai = [
    { key: "completed", label: "Hoàn thành", value: duLieu.hoanThanh, color: "#22c55e", cls: "is-completed" },
    { key: "in-progress", label: "Đang làm", value: duLieu.dangLam, color: "#f59e0b", cls: "is-progress" },
    { key: "not-started", label: "Chưa bắt đầu", value: duLieu.chuaBatDau, color: "#64748b", cls: "is-paused" },
    { key: "overdue", label: "Quá hạn", value: duLieu.quaHan, color: "#ef4444", cls: "is-overdue" }
  ];

  const tongAnToan = duLieu.tong || 1;
  const duLieuCoGiaTri = trangThai.filter(item => item.value > 0);
  if (!duLieuCoGiaTri.length) {
    donut.style.background = "conic-gradient(#e2e8f0 0deg 360deg)";
  } else {
    let goc = 0;
    const mangGoc = duLieuCoGiaTri.map(item => {
      const batDau = goc;
      goc += (item.value / tongAnToan) * 360;
      return `${item.color} ${batDau}deg ${goc}deg`;
    });
    donut.style.background = `conic-gradient(${mangGoc.join(",")})`;
  }

  const phanTramHoanThanh = duLieu.tong ? Math.round((duLieu.hoanThanh / duLieu.tong) * 100) : 0;
  donutCenter.textContent = `${phanTramHoanThanh}%`;
  donutLegend.innerHTML = trangThai.map(item => {
    const pt = duLieu.tong ? Math.round((item.value / duLieu.tong) * 100) : 0;
    return `<div class="task-donut-item">
      <span class="task-donut-dot" style="background:${item.color}"></span>
      <span class="task-donut-label">${item.label}</span>
      <span class="task-donut-metric">${item.value} (${pt}%)</span>
    </div>`;
  }).join("");

  const maxTrangThai = Math.max(...trangThai.map(item => item.value), 1);
  statusBars.innerHTML = trangThai.map(item => {
    const width = item.value ? Math.max((item.value / maxTrangThai) * 100, 8) : 0;
    return `<div class="task-status-row">
      <div class="task-status-label">${item.label}</div>
      <div class="task-status-track">
        <div class="task-status-fill ${item.cls}" style="width:${width}%">${item.value}</div>
      </div>
    </div>`;
  }).join("");

  const deg = phanTramHoanThanh * 3.6;
  progressRing.style.background = `conic-gradient(#22c55e 0deg ${deg}deg, #e2e8f0 ${deg}deg 360deg)`;
  progressValue.textContent = `${phanTramHoanThanh}%`;
  progressNote.textContent = duLieu.tong
    ? `${duLieu.hoanThanh}/${duLieu.tong} công việc đã hoàn thành`
    : "Chưa có dữ liệu để đánh giá.";
}

function locCongViec() {
  const tk = ($("searchInput").value || "").trim().toLowerCase();
  const st = $("statusFilter").value;
  const pr = $("priorityFilter").value;
  const dm = $("categoryFilter").value;
  return danhSachCongViec.filter(cv => {
    const tt = layTrangThaiFE(cv);
    return (tabHienTai === "all" || tt === tabHienTai) &&
      (st === "all" || tt === st) && (pr === "all" || cv.priority === pr) && (dm === "all" || String(cv.category_id) === dm) &&
      (cv.title.toLowerCase().includes(tk) || (cv.description || "").toLowerCase().includes(tk));
  });
}

function taoHTMLTaskCard(cv) {
  const tt = layTrangThaiFE(cv), bt = bieuTuong(tt), lngay = tt === "overdue" ? "date red-text" : "date";
  const iconCv = chonIconCongViec(cv);
  return `<article class="task-card ${tt === "overdue" ? "overdue" : ""}">
    <div class="task-row"><div class="task-left">
      <div class="task-icon" style="color:${bt.m}">${iconCv}</div>
      <div class="task-content"><div class="task-title">${thoatHtml(cv.title)}</div>
        <div class="task-meta">
          <span class="pill ${lopTrangThai(tt)}">${nhanTrangThai(tt)}</span>
          <span class="pill ${lopUuTien(cv.priority)}">${nhanUuTien(cv.priority)}</span>
          <span class="${lngay}">Hạn: ${nhanNgay(cv)}</span>
          ${cv.category_name ? `<span class="pill purple">${thoatHtml(cv.category_name)}</span>` : ""}
        </div></div></div>
      <div class="task-actions"><div class="action-icons">
        <button class="action-btn edit-btn" data-id="${cv.task_id}" title="Sửa">Sửa</button>
        <button class="action-btn delete-btn" data-id="${cv.task_id}" title="Xóa">Xóa</button>
      </div><button class="detail-link toggle-detail-btn">Mô tả</button></div>
    </div>
    <div class="task-detail">
      <div class="td-desc">
        ${thoatHtml(cv.description || "Không có nội dung mô tả.")}
      </div>
    </div>
  </article>`;
}

function hienThiCongViec() {
  const ds = locCongViec().sort((a, b) => {
    const pA = { high: 3, medium: 2, low: 1 }[a.priority] || 0;
    const pB = { high: 3, medium: 2, low: 1 }[b.priority] || 0;
    if (pA !== pB) return pB - pA;
    return new Date(a.due_date || "9999") - new Date(b.due_date || "9999");
  });

  const isDefaultView = tabHienTai === "all" && !$("searchInput").value.trim() && $("statusFilter").value === "all" && $("priorityFilter").value === "all" && $("categoryFilter").value === "all";
  if (isDefaultView) {
    const focusTask = ds.find(cv => layTrangThaiFE(cv) !== "completed" && layTrangThaiFE(cv) !== "overdue" && cv.priority === "high");
    if (focusTask) {
      $("focusModeContainer").style.display = "block";
      $("focusTaskCard").innerHTML = taoHTMLTaskCard(focusTask);
    } else {
      $("focusModeContainer").style.display = "none";
    }
  } else {
    $("focusModeContainer").style.display = "none";
  }

  const el = $("taskList");
  if (!ds.length) { el.innerHTML = ""; $("emptyState").classList.add("show"); capNhatSoDem(); return; }
  $("emptyState").classList.remove("show");
  el.innerHTML = ds.map(taoHTMLTaskCard).join("");
  capNhatSoDem();
}

function moModalCongViec(cheDo, cv = null) {
  $("modalTitle").textContent = cheDo === "add" ? "Thêm công việc" : "Sửa công việc";
  const f = $("taskForm");
  khoiTaoPicker();

  if (cheDo === "add") {
    f.reset();
    $("taskId").value = "";
    $("taskStatus").value = "pending";
    $("taskPriority").value = "medium";
    $("taskReminder").value = "0";
    $("taskCategory").value = "";
    // Mặc định ngày bắt đầu là thời điểm hiện tại, hạn là hôm nay 23:59
    const thoiDiemTao = new Date();
    const mac_dinh = new Date(); mac_dinh.setHours(23, 59, 0, 0);
    dtpStart.datGiaTri(thoiDiemTao.toISOString());
    dtpDue.datGiaTri(mac_dinh.toISOString());
  } else if (cv) {
    $("taskId").value = cv.task_id;
    $("taskTitle").value = cv.title;
    $("taskDescription").value = cv.description || "";
    $("taskStatus").value = cv.status; // giữ status gốc từ BE
    $("taskPriority").value = cv.priority;
    $("taskReminder").value = String(cv.reminder_minutes ?? 0);
    $("taskCategory").value = cv.category_id || "";
    dtpStart.datGiaTri(cv.start_date || "");
    dtpDue.datGiaTri(cv.due_date || "");
  }
  capNhatSelectDanhMuc();
  $("modalBackdrop").classList.add("show");
  
  // Tự động điều chỉnh kích thước ô mô tả khi mở
  setTimeout(() => {
    const ta = $("taskDescription");
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, 10);
}

function dongModal() {
  $("modalBackdrop").classList.remove("show");
  $("taskForm").reset();
  $("taskId").value = "";
  if (dtpStart) { dtpStart.datGiaTri(""); dtpDue.datGiaTri(""); }
}

$("openAddModal").addEventListener("click", () => moModalCongViec("add"));
$("closeModal").addEventListener("click", dongModal);
$("cancelModal").addEventListener("click", dongModal);

// Auto-resize ô mô tả khi người dùng gõ
$("taskDescription").addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

$("modalBackdrop").addEventListener("click", e => { if (e.target === $("modalBackdrop")) dongModal(); });

$("taskForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = $("taskId").value;

  const title = $("taskTitle").value.trim();
  const startDate = $("taskStartDate").value; // "YYYY-MM-DDTHH:MM"
  const dueDate = $("taskDueDate").value;
  const statusGuiLen = id ? $("taskStatus").value : "pending";
  const priorityGuiLen = $("taskPriority").value;
  const reminderGuiLen = $("taskReminder").value;
  const trangThaiHopLe = ["pending", "in_progress", "completed", "overdue"];
  const mucUuTienHopLe = ["low", "medium", "high"];
  const mocNhacHopLe = ["0", "30", "60"];

  if (!title) {
    hienToast("Tên công việc không được để trống!", "error");
    return;
  }

  if (!trangThaiHopLe.includes(statusGuiLen)) {
    hienToast("Trạng thái công việc không hợp lệ!", "error");
    return;
  }

  if (!mucUuTienHopLe.includes(priorityGuiLen)) {
    hienToast("Mức ưu tiên không hợp lệ!", "error");
    return;
  }

  if (!mocNhacHopLe.includes(reminderGuiLen)) {
    hienToast("Mốc nhắc việc không hợp lệ!", "error");
    return;
  }

  if (!startDate) {
    hienToast("Vui lòng chọn ngày bắt đầu!", "error");
    return;
  }
  if (!dueDate) {
    hienToast("Vui lòng chọn hạn hoàn thành!", "error");
    return;
  }

  const startDateObj = new Date(startDate);
  const dueDateObj = new Date(dueDate);
  if (Number.isNaN(startDateObj.getTime()) || Number.isNaN(dueDateObj.getTime())) {
    hienToast("Ngày bắt đầu hoặc hạn hoàn thành không hợp lệ!", "error");
    return;
  }

  // Không cho thêm công việc có hạn trong quá khứ (chỉ kiểm tra khi tạo mới)
  if (!id && dueDateObj < new Date()) {
    hienToast("⚠️ Không thể tạo công việc đã quá hạn!", "error");
    return;
  }

  if (startDateObj > dueDateObj) {
    hienToast("Ngày bắt đầu không được lớn hơn hạn hoàn thành!", "error");
    return;
  }

  // Trạng thái luôn do hệ thống tính: tạo mới = pending, sửa giữ nguyên status gốc
  const dl = {
    title,
    description: $("taskDescription").value.trim(),
    status: statusGuiLen,
    priority: priorityGuiLen,
    reminder_minutes: Number.parseInt(reminderGuiLen, 10),
    start_date: startDate || null,
    due_date: dueDate,
    category_id: $("taskCategory").value || null
  };

  try {
    if (id) await goiAPI("/tasks/" + id + "/user/" + nguoiDungHienTai.user_id, { method: "PUT", body: dl });
    else await goiAPI("/tasks/user/" + nguoiDungHienTai.user_id, { method: "POST", body: dl });
    dongModal();
    // Tự động tạo thông báo nhắc việc sau khi lưu
    try { await goiAPI("/notifications/user/" + nguoiDungHienTai.user_id + "/reminders", { method: "POST" }); } catch { }
    await taiCongViec();
    await taiThongBao();
    hienToast(id ? "Đã cập nhật!" : "Đã thêm!", "success");
  } catch (l) { hienToast(l.message, "error"); }
});

$("searchInput").addEventListener("input", hienThiCongViec);
$("statusFilter").addEventListener("change", hienThiCongViec);
$("priorityFilter").addEventListener("change", hienThiCongViec);
$("categoryFilter").addEventListener("change", hienThiCongViec);
$("toggleFilterBtn").addEventListener("click", () => $("filterPanel").classList.toggle("show"));
$("resetFilterBtn").addEventListener("click", () => {
  $("searchInput").value = ""; $("statusFilter").value = "all"; $("priorityFilter").value = "all"; $("categoryFilter").value = "all";
  tabHienTai = "all"; document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelector('[data-tab="all"]').classList.add("active"); hienThiCongViec();
});
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active"); tabHienTai = t.dataset.tab; hienThiCongViec();
}));

const xuLyHanhDongTask = async e => {
  const nutSua = e.target.closest(".edit-btn"), nutXoa = e.target.closest(".delete-btn"), nutCT = e.target.closest(".toggle-detail-btn");
  if (nutSua) { const cv = danhSachCongViec.find(x => String(x.task_id) === String(nutSua.dataset.id)); if (cv) moModalCongViec("edit", cv); }
  if (nutXoa) {
    const cv = danhSachCongViec.find(x => String(x.task_id) === String(nutXoa.dataset.id)); if (!cv) return;
    if (!confirm('Xóa "' + cv.title + '"?')) return;
    try { await goiAPI("/tasks/" + cv.task_id + "/user/" + nguoiDungHienTai.user_id, { method: "DELETE" }); await taiCongViec(); hienToast("Đã xóa!", "success"); } catch (l) { alert(l.message); }
  }
  if (nutCT) { const dt = nutCT.closest(".task-card").querySelector(".task-detail"); const mo = dt.classList.toggle("show"); nutCT.innerHTML = mo ? "Ẩn mô tả" : "Mô tả"; }
};

$("taskList").addEventListener("click", xuLyHanhDongTask);
$("focusTaskCard").addEventListener("click", xuLyHanhDongTask);

// ===== QUẢN LÝ DANH MỤC (CATEGORY MANAGEMENT) =====
async function taiDanhMuc() {
  try {
    if (!nguoiDungHienTai) return;
    danhSachDanhMuc = await goiAPI("/categories/user/" + nguoiDungHienTai.user_id);
    capNhatFilterDanhMuc();
  } catch { danhSachDanhMuc = []; }
}

function capNhatSelectDanhMuc() {
  const sel = $("taskCategory");
  if (!sel) return;
  const val = sel.value;
  sel.innerHTML = '<option value=""></option>';
  danhSachDanhMuc.forEach(dm => {
    sel.innerHTML += `<option value="${dm.category_id}">${thoatHtml(dm.name)}</option>`;
  });
  sel.value = val;
}

function capNhatFilterDanhMuc() {
  const sel = $("categoryFilter");
  if (!sel) return;
  const val = sel.value;
  sel.innerHTML = '<option value="all">Tất cả</option>';
  danhSachDanhMuc.forEach(dm => {
    sel.innerHTML += `<option value="${dm.category_id}">${thoatHtml(dm.name)}</option>`;
  });
  sel.value = val;
}

let dangSuaDanhMucId = null;

function khoiTaoSelectIconDanhMuc() {
  const sel = $("iconDanhMucMoi");
  if (!sel) return;
  sel.innerHTML = DANH_SACH_ICON_DANH_MUC
    .map(icon => `<option value="${icon}">${icon}</option>`)
    .join("");
}

function moFormDanhMuc(cheDo = "them", dm = null) {
  const form = $("formThemDanhMuc");
  const inputTen = $("tenDanhMucMoi");
  const selectIcon = $("iconDanhMucMoi");
  const nutLuu = $("nutLuuDanhMuc");
  if (!form || !inputTen || !selectIcon || !nutLuu) return;

  if (!selectIcon.options.length) khoiTaoSelectIconDanhMuc();

  dangSuaDanhMucId = cheDo === "sua" && dm ? dm.category_id : null;
  nutLuu.textContent = dangSuaDanhMucId ? "Cập nhật" : "Lưu";
  form.style.display = "flex";

  if (dm) {
    inputTen.value = dm.name || "";
    selectIcon.value = chuanHoaIconDanhMuc(dm.icon || chonIconDanhMuc(dm));
  } else {
    inputTen.value = "";
    selectIcon.value = DANH_SACH_ICON_DANH_MUC[0];
  }
  inputTen.focus();
}

function dongFormDanhMuc() {
  const form = $("formThemDanhMuc");
  const inputTen = $("tenDanhMucMoi");
  const selectIcon = $("iconDanhMucMoi");
  if (!form || !inputTen || !selectIcon) return;
  dangSuaDanhMucId = null;
  form.style.display = "none";
  inputTen.value = "";
  if (selectIcon.options.length) {
    selectIcon.value = DANH_SACH_ICON_DANH_MUC[0];
  }
  $("nutLuuDanhMuc").textContent = "Lưu";
}

async function taiVaHienDanhMuc() {
  await taiDanhMuc();
  const el = $("danhSachDanhMuc");
  const rong = $("rongDanhMuc");
  if (!danhSachDanhMuc.length) {
    el.innerHTML = "";
    rong.classList.add("show");
    return;
  }

  rong.classList.remove("show");
  el.innerHTML = danhSachDanhMuc.map(dm => `
    <div class="dm-card">
      <span class="dm-card-name"><span class="dm-icon">${chonIconDanhMuc(dm)}</span>${thoatHtml(dm.name)}</span>
      <div class="dm-card-actions">
        <button class="btn-sm btn-secondary" onclick="suaDanhMuc(${dm.category_id})">Sửa</button>
        <button class="btn-sm btn-danger" onclick="xoaDanhMucUI(${dm.category_id})">Xóa</button>
      </div>
    </div>
  `).join("");
}

$("nutThemDanhMuc").addEventListener("click", () => {
  moFormDanhMuc("them");
});

$("nutHuyDanhMuc").addEventListener("click", () => {
  dongFormDanhMuc();
});

$("nutLuuDanhMuc").addEventListener("click", async () => {
  const ten = $("tenDanhMucMoi").value.trim();
  const iconChon = chuanHoaIconDanhMuc($("iconDanhMucMoi")?.value);
  if (!ten) {
    hienToast("Vui lòng nhập tên danh mục.", "warning");
    return;
  }
  try {
    if (dangSuaDanhMucId) {
      await goiAPI("/categories/" + dangSuaDanhMucId + "/user/" + nguoiDungHienTai.user_id, {
        method: "PUT",
        body: { name: ten, icon: iconChon }
      });
      hienToast("Đã cập nhật danh mục!", "success");
    } else {
      await goiAPI("/categories/user/" + nguoiDungHienTai.user_id, { method: "POST", body: { name: ten, icon: iconChon } });
      hienToast("Đã tạo danh mục!", "success");
    }
    dongFormDanhMuc();
    await taiVaHienDanhMuc();
  } catch (l) {
    hienToast(l.message, "error");
  }
});

function suaDanhMuc(id) {
  const dm = danhSachDanhMuc.find(x => String(x.category_id) === String(id));
  if (!dm) return;
  moFormDanhMuc("sua", dm);
}

async function xoaDanhMucUI(id) {
  if (!confirm("Xóa danh mục này?")) return;
  try {
    await goiAPI("/categories/" + id + "/user/" + nguoiDungHienTai.user_id, { method: "DELETE" });
    hienToast("Đã xóa!", "success");
    await taiVaHienDanhMuc();
  } catch (l) {
    hienToast(l.message, "error");
  }
}

// ===== QUAN LY THONG BAO (NOTIFICATION MANAGEMENT) =====
async function taiThongBao() {
  if (!nguoiDungHienTai) return;
  try {
    const ds = await goiAPI("/notifications/user/" + nguoiDungHienTai.user_id);
    const el = $("danhSachThongBao"), rong = $("rongThongBao");
    if (!ds.length) { el.innerHTML = ""; rong.classList.add("show"); badgeThongBao(0); return; }
    rong.classList.remove("show");
    el.innerHTML = ds.map(tb => `
      <div class="tb-card ${tb.is_read ? "" : "unread"}">
        <span class="tb-icon">${tb.is_read ? "Đã đọc" : "Mới"}</span>
        <div class="tb-content">
          <div class="tb-message">${thoatHtml(tb.message)}</div>
          <div class="tb-time">${new Date(tb.created_at).toLocaleString("vi-VN")}</div>
        </div>
        <div class="tb-actions">
          ${!tb.is_read ? `<button class="btn-sm btn-secondary" onclick="docThongBao(${tb.notification_id})">Đọc</button>` : ""}
          <button class="btn-sm btn-danger" onclick="xoaThongBaoUI(${tb.notification_id})">Xóa</button>
        </div>
      </div>
    `).join("");

    const chuaDoc = ds.filter(t => !t.is_read).length;
    badgeThongBao(chuaDoc);
  } catch { /* bo qua */ }
}

function badgeThongBao(chuaDoc) {
  const badge = $("badgeThongBao");
  if (chuaDoc > 0) { badge.textContent = chuaDoc; badge.style.display = "inline"; }
  else { badge.style.display = "none"; }
}

async function docThongBao(id) {
  try {
    await goiAPI("/notifications/" + id + "/user/" + nguoiDungHienTai.user_id + "/read", { method: "PATCH" });
    await taiThongBao();
  } catch (l) { hienToast(l.message, "error"); }
}

async function xoaThongBaoUI(id) {
  try {
    await goiAPI("/notifications/" + id + "/user/" + nguoiDungHienTai.user_id, { method: "DELETE" });
    hienToast("Đã xóa thông báo!", "success");
    await taiThongBao();
  } catch (l) {
    hienToast(l.message, "error");
  }
}

$("nutDocTatCa").addEventListener("click", async () => {
  if (!nguoiDungHienTai) return;
  try {
    await goiAPI("/notifications/user/" + nguoiDungHienTai.user_id + "/read-all", { method: "PATCH" });
    hienToast("Đã đánh dấu tất cả đã đọc!", "success");
    await taiThongBao();
  } catch (l) {
    hienToast(l.message, "error");
  }
});

// Thông báo nhắc việc được tạo tự động sau khi lưu công việc — không cần nút thủ công

// ===== THỐNG KÊ (STATISTICS) =====
async function taiThongKe() {
  const dem = { tong: danhSachCongViec.length, chuaBatDau: 0, dangLam: 0, hoanThanh: 0, quaHan: 0 };
  danhSachCongViec.forEach(cv => {
    const tt = layTrangThaiFE(cv);
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
        <div class="chart-bar-fill ${d.lop}" style="width:${Math.max(d.so / max * 100, d.so ? 8 : 0)}%">${d.so}</div>
      </div>
    </div>
  `).join("");
}

// ===== THÔNG TIN CÁ NHÂN (USER PROFILE) =====
let avatarBase64 = null; // Lưu trữ avatar dưới dạng base64
const AVATAR_GIOI_HAN_MB = 15;
const AVATAR_GIOI_HAN_BYTE = AVATAR_GIOI_HAN_MB * 1024 * 1024; // 15MB
// Mục tiêu nén để payload JSON ổn định nhưng vẫn giữ chất lượng ảnh tốt hơn
const AVATAR_MUC_TIEU_DATAURL = 8 * 1024 * 1024; // 8MB

function docFileThanhDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh."));
    reader.readAsDataURL(file);
  });
}

function taiAnhTuDataURL(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không thể xử lý ảnh đã chọn."));
    img.src = dataUrl;
  });
}

function tinhKichThuocTuDataURL(dataUrl) {
  const ketQua = dataUrl.match(/^data:.*;base64,(.*)$/);
  if (!ketQua || !ketQua[1]) return 0;
  return Math.floor((ketQua[1].length * 3) / 4);
}

async function toiUuAvatar(file) {
  const dataUrlGoc = await docFileThanhDataURL(file);
  if (dataUrlGoc.length <= AVATAR_MUC_TIEU_DATAURL) return dataUrlGoc;

  const img = await taiAnhTuDataURL(dataUrlGoc);
  const maxCanh = 1200;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  const tyLe = Math.min(1, maxCanh / Math.max(w, h));
  w = Math.max(1, Math.round(w * tyLe));
  h = Math.max(1, Math.round(h * tyLe));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  let quality = 0.9;
  let dataUrlNen = canvas.toDataURL("image/jpeg", quality);
  while (dataUrlNen.length > AVATAR_MUC_TIEU_DATAURL && quality > 0.45) {
    quality -= 0.1;
    dataUrlNen = canvas.toDataURL("image/jpeg", quality);
  }
  return dataUrlNen;
}

function taiCaNhan() {
  if (!nguoiDungHienTai) return;
  $("cnHoTen").value = nguoiDungHienTai.full_name || "";
  $("cnEmail").value = nguoiDungHienTai.email || "";
  $("cnMoTa").value = nguoiDungHienTai.bio || "";

  capNhatHienThiAvatarCaNhan(nguoiDungHienTai.avatar_url);
  if (!nguoiDungHienTai.avatar_url) avatarBase64 = null;
}

function capNhatHienThiAvatarCaNhan(avatarUrl) {
  const avatarEl = $("avatarCaNhan");
  const avatarLetterEl = $("avatarLetter");
  if (!avatarEl || !avatarLetterEl) return;

  avatarLetterEl.textContent = (nguoiDungHienTai?.full_name || "U").charAt(0).toUpperCase();
  if (avatarUrl) {
    avatarEl.style.backgroundImage = `url(${avatarUrl})`;
    avatarEl.style.backgroundSize = "cover";
    avatarEl.style.backgroundPosition = "center";
    avatarEl.classList.add("has-image");
  } else {
    avatarEl.style.backgroundImage = "none";
    avatarEl.classList.remove("has-image");
  }
}

function moChonAnhAvatar() {
  $("cnAvatar").click();
}

async function xoaAvatarHienTai() {
  if (!nguoiDungHienTai) return;

  // Nếu chỉ mới chọn ảnh local mà chưa lưu
  if (!nguoiDungHienTai.avatar_url && avatarBase64) {
    avatarBase64 = null;
    $("cnAvatar").value = "";
    capNhatHienThiAvatarCaNhan(null);
    hienToast("Đã hủy ảnh vừa chọn.", "info");
    return;
  }

  if (!nguoiDungHienTai.avatar_url) {
    hienToast("Hiện tại bạn chưa có avatar!", "info");
    return;
  }

  try {
    const kq = await goiAPI("/users/" + nguoiDungHienTai.user_id + "/avatar", { method: "DELETE" });
    nguoiDungHienTai = kq.nguoiDung || { ...nguoiDungHienTai, avatar_url: null };
    luuDuLieuDangNhap(nguoiDungHienTai, accessToken);
    $("cnAvatar").value = "";
    avatarBase64 = null;
    capNhatThongTinNguoiDung();
    capNhatHienThiAvatarCaNhan(null);
    hienToast("Đã xóa avatar thành công!", "success");
  } catch (l) {
    hienToast(l.message, "error");
  }
}

// Xử lý chọn file avatar
$("cnAvatar").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Kiểm tra loại file
  if (!file.type.startsWith("image/")) {
    hienToast("Vui lòng chọn file hình ảnh!", "error");
    $("cnAvatar").value = "";
    return;
  }

  // Kiểm tra kích thước
  if (file.size > AVATAR_GIOI_HAN_BYTE) {
    hienToast(`Ảnh quá lớn! Tối đa ${AVATAR_GIOI_HAN_MB}MB.`, "error");
    $("cnAvatar").value = "";
    return;
  }

  try {
    // Tối ưu ảnh trước khi gửi để tránh lỗi "request entity too large"
    avatarBase64 = await toiUuAvatar(file);

    if (tinhKichThuocTuDataURL(avatarBase64) > AVATAR_GIOI_HAN_BYTE) {
      hienToast("Ảnh sau khi xử lý vẫn quá lớn. Vui lòng chọn ảnh nhỏ hơn.", "error");
      $("cnAvatar").value = "";
      avatarBase64 = null;
      return;
    }

    capNhatHienThiAvatarCaNhan(avatarBase64);
    hienToast("Chọn ảnh thành công! Hãy bấm 'Lưu thay đổi' để lưu.", "info");
  } catch (loi) {
    avatarBase64 = null;
    $("cnAvatar").value = "";
    capNhatHienThiAvatarCaNhan(nguoiDungHienTai?.avatar_url || null);
    hienToast(loi.message || "Không thể xử lý ảnh đã chọn.", "error");
  }
});

$("avatarCaNhan").addEventListener("click", () => {
  moChonAnhAvatar();
});

const nutXoaAnhCaNhan = $("btnXoaAnhCaNhan");
if (nutXoaAnhCaNhan) {
  nutXoaAnhCaNhan.addEventListener("click", async (e) => {
    e.preventDefault();
    await xoaAvatarHienTai();
  });
}

$("formCaNhan").addEventListener("submit", async e => {
  e.preventDefault();
  $("loiCaNhan").textContent = "";
  try {
    // Nếu người dùng chọn avatar mới, cập nhật nó trước
    if (avatarBase64) {
      await goiAPI("/users/" + nguoiDungHienTai.user_id + "/avatar", {
        method: "PUT", body: { avatar_url: avatarBase64 }
      });
    }

    const kq = await goiAPI("/users/" + nguoiDungHienTai.user_id, {
      method: "PUT", body: { full_name: $("cnHoTen").value, bio: $("cnMoTa").value }
    });
    nguoiDungHienTai = kq.nguoiDung || kq.user || { ...nguoiDungHienTai, full_name: $("cnHoTen").value };
    
    // Nếu đã cập nhật avatar, cập nhật dữ liệu từ server
    if (avatarBase64) {
      const userData = await goiAPI("/users/" + nguoiDungHienTai.user_id);
      nguoiDungHienTai = userData;
    }

    luuDuLieuDangNhap(nguoiDungHienTai, accessToken);
    capNhatThongTinNguoiDung();
    $("cnAvatar").value = "";
    avatarBase64 = null;
    hienToast("Đã cập nhật thông tin!", "success");
    taiCaNhan();
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
    hienToast("Đổi mật khẩu thành công!", "success");
    $("formDoiMatKhau").reset();
  } catch (l) { $("loiDoiMK").textContent = l.message; }
});

// ===== CHỨC NĂNG QUẢN TRỊ (ADMIN PANEL) =====
async function taiQuanTri() {
  if (!nguoiDungHienTai || nguoiDungHienTai.role !== "admin") return;
  try {
    const ds = await goiAPI("/users");
    $("danhSachNguoiDung").innerHTML = ds.map(nd => `
      <tr>
        <td>${nd.user_id}</td>
        <td>${thoatHtml(nd.full_name)}</td>
        <td>${thoatHtml(nd.email)}</td>
        <td><span class="pill ${nd.role === "admin" ? "blue" : "gray"}">${nd.role}</span></td>
        <td><span class="pill ${nd.is_locked ? "red" : "green"}">${nd.is_locked ? "Đã khóa" : "Hoạt động"}</span></td>
        <td>
          ${nd.user_id !== nguoiDungHienTai.user_id ? `
            <button class="btn-sm ${nd.is_locked ? "btn-success" : "btn-danger"}" onclick="khoaMoKhoa(${nd.user_id},${!nd.is_locked})">
              ${nd.is_locked ? "Mở khóa" : "Khóa"}
            </button>
          ` : "<em>Bạn</em>"}
        </td>
      </tr>
    `).join("");
  } catch (l) { hienToast(l.message, "error"); }
}

window.khoaMoKhoa = async function (id, khoa) {
  try {
    await goiAPI("/users/" + id + "/lock", { method: "PATCH", body: { is_locked: khoa } });
    hienToast(khoa ? "Đã khóa tài khoản!" : "Đã mở khóa!", "success");
    await taiQuanTri();
  } catch (l) { hienToast(l.message, "error"); }
}

$("nutXoaTatCaThongBao")?.addEventListener("click", async () => {
  if (!nguoiDungHienTai) return;
  if (!confirm("Bạn có chắc muốn xóa hết thông báo không?")) return;

  try {
    // Uu tien endpoint xoa tat ca neu backend da cap nhat
    try {
      const kq = await goiAPI("/notifications/user/" + nguoiDungHienTai.user_id + "/all", { method: "DELETE" });
      hienToast(kq.message || "Đã xóa tất cả thông báo!", "success");
      await taiThongBao();
      return;
    } catch (loiXoaTatCa) {
      // fallback: xoa tung thong bao de tuong thich server cu
      const dsThongBao = await goiAPI("/notifications/user/" + nguoiDungHienTai.user_id);
      if (!Array.isArray(dsThongBao) || dsThongBao.length === 0) {
        hienToast("Không có thông báo để xóa.", "info");
        await taiThongBao();
        return;
      }

      for (const tb of dsThongBao) {
        await goiAPI("/notifications/" + tb.notification_id + "/user/" + nguoiDungHienTai.user_id, { method: "DELETE" });
      }

      hienToast("Đã xóa tất cả thông báo!", "success");
      await taiThongBao();
    }
  } catch (l) {
    hienToast(l.message || "Không xóa được tất cả thông báo.", "error");
  }
});



