const DUONG_DAN_API = "/api/tasks";

const danhSachCongViecUI = document.getElementById("taskList");
const trangThaiRong = document.getElementById("emptyState");

const oTimKiem = document.getElementById("searchInput");
const locTrangThai = document.getElementById("statusFilter");
const locMucUuTien = document.getElementById("priorityFilter");
const nutDatLaiBoLoc = document.getElementById("resetFilterBtn");
const nutMoBoLoc = document.getElementById("toggleFilterBtn");
const bangBoLoc = document.getElementById("filterPanel");

const danhSachTab = document.querySelectorAll(".tab");

const nenModal = document.getElementById("modalBackdrop");
const tieuDeModal = document.getElementById("modalTitle");
const nutMoThemModal = document.getElementById("openAddModal");
const nutDongModal = document.getElementById("closeModal");
const nutHuyModal = document.getElementById("cancelModal");
const bieuMauCongViec = document.getElementById("taskForm");

const oMaCongViec = document.getElementById("taskId");
const oTenCongViec = document.getElementById("taskTitle");
const oMoTaCongViec = document.getElementById("taskDescription");
const oTrangThaiCongViec = document.getElementById("taskStatus");
const oMucUuTienCongViec = document.getElementById("taskPriority");
const oHanCongViec = document.getElementById("taskDueDate");

let tabHienTai = "all";
let danhSachCongViec = [];

function layNgayHomNay() {
  const homNay = new Date();
  const chenhLech = homNay.getTimezoneOffset();
  const ngayLocal = new Date(homNay.getTime() - chenhLech * 60000);
  return ngayLocal.toISOString().split("T")[0];
}

function laQuaHan(congViec) {
  if (congViec.status === "completed") return false;
  return congViec.dueDate < layNgayHomNay();
}

function layTrangThaiHienThi(congViec) {
  if (congViec.status === "completed") return "completed";
  if (laQuaHan(congViec)) return "overdue";
  return congViec.status;
}

function layNhanTrangThai(trangThai) {
  return {
    "not-started": "Chua bat dau",
    "in-progress": "Dang lam",
    "completed": "Hoan thanh",
    "overdue": "Qua han"
  }[trangThai];
}

function layNhanMucUuTien(mucUuTien) {
  return {
    low: "Thap",
    medium: "Trung binh",
    high: "Cao"
  }[mucUuTien];
}

function layLopTrangThai(trangThai) {
  return {
    "not-started": "gray",
    "in-progress": "blue",
    "completed": "green",
    "overdue": "red"
  }[trangThai];
}

function layLopMucUuTien(mucUuTien) {
  return {
    low: "gray",
    medium: "orange",
    high: "red"
  }[mucUuTien];
}

function layBieuTuongCongViec(trangThai) {
  return {
    "not-started": { kyHieu: "◯", mauSac: "#777" },
    "in-progress": { kyHieu: "▷", mauSac: "#3b82f6" },
    "completed": { kyHieu: "✔", mauSac: "#10b981" },
    "overdue": { kyHieu: "⚠", mauSac: "#ef4444" }
  }[trangThai];
}

function dinhDangNgay(chuoiNgay) {
  if (!chuoiNgay) return "Khong co han";
  const [nam, thang, ngay] = chuoiNgay.split("-");
  return `${ngay}/${thang}/${nam}`;
}

function dinhDangNhanNgay(congViec) {
  if (!congViec.dueDate) return "Khong co han";
  if (congViec.dueDate === layNgayHomNay()) return "Hom nay";
  return dinhDangNgay(congViec.dueDate);
}

function thoatHtml(vanBan) {
  const the = document.createElement("div");
  the.textContent = vanBan || "";
  return the.innerHTML;
}

async function taiDanhSachCongViec() {
  const phanHoi = await fetch(DUONG_DAN_API);
  if (!phanHoi.ok) throw new Error("Khong tai duoc du lieu.");
  danhSachCongViec = await phanHoi.json();
}

function capNhatThongKe() {
  const soDem = {
    all: danhSachCongViec.length,
    "not-started": 0,
    "in-progress": 0,
    "completed": 0,
    "overdue": 0
  };

  danhSachCongViec.forEach((congViec) => {
    const trangThai = layTrangThaiHienThi(congViec);
    soDem[trangThai] += 1;
  });

  document.getElementById("stat-total").textContent = `${soDem.all} tong`;
  document.getElementById("stat-not-started").textContent = `${soDem["not-started"]} chua bat dau`;
  document.getElementById("stat-in-progress").textContent = `${soDem["in-progress"]} dang lam`;
  document.getElementById("stat-completed").textContent = `${soDem["completed"]} xong`;
  document.getElementById("stat-overdue").textContent = `${soDem["overdue"]} qua han`;

  danhSachTab.forEach((tab) => {
    const khoaTab = tab.dataset.tab;
    tab.querySelector("span").textContent = soDem[khoaTab];
  });
}

function layDanhSachDaLoc() {
  const tuKhoa = oTimKiem.value.trim().toLowerCase();
  const trangThaiChon = locTrangThai.value;
  const mucUuTienChon = locMucUuTien.value;

  return danhSachCongViec.filter((congViec) => {
    const trangThaiHienThi = layTrangThaiHienThi(congViec);

    const khopTab = tabHienTai === "all" || trangThaiHienThi === tabHienTai;
    const khopTimKiem =
      congViec.title.toLowerCase().includes(tuKhoa) ||
      (congViec.description || "").toLowerCase().includes(tuKhoa);

    const khopTrangThai = trangThaiChon === "all" || trangThaiHienThi === trangThaiChon;
    const khopMucUuTien = mucUuTienChon === "all" || congViec.priority === mucUuTienChon;

    return khopTab && khopTimKiem && khopTrangThai && khopMucUuTien;
  });
}

function hienThiDanhSach() {
  const danhSachDaLoc = layDanhSachDaLoc().sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  if (danhSachDaLoc.length === 0) {
    danhSachCongViecUI.innerHTML = "";
    trangThaiRong.classList.add("show");
    capNhatThongKe();
    return;
  }

  trangThaiRong.classList.remove("show");

  danhSachCongViecUI.innerHTML = danhSachDaLoc.map((congViec) => {
    const trangThaiHienThi = layTrangThaiHienThi(congViec);
    const lopTrangThai = layLopTrangThai(trangThaiHienThi);
    const lopMucUuTien = layLopMucUuTien(congViec.priority);
    const bieuTuong = layBieuTuongCongViec(trangThaiHienThi);
    const lopNgay = trangThaiHienThi === "overdue" ? "date red-text" : "date";

    return `
      <article class="task-card ${trangThaiHienThi === "overdue" ? "overdue" : ""}">
        <div class="task-row">
          <div class="task-left">
            <div class="task-icon" style="color:${bieuTuong.mauSac}">${bieuTuong.kyHieu}</div>
            <div class="task-content">
              <div class="task-title">${thoatHtml(congViec.title)}</div>
              <div class="task-meta">
                <span class="pill ${lopTrangThai}">${layNhanTrangThai(trangThaiHienThi)}</span>
                <span class="pill ${lopMucUuTien}">${layNhanMucUuTien(congViec.priority)}</span>
                <span class="${lopNgay}">🗓 ${dinhDangNhanNgay(congViec)}</span>
              </div>
            </div>
          </div>

          <div class="task-actions">
            <div class="action-icons">
              <button class="action-btn edit-btn" type="button" data-id="${congViec.id}">✎</button>
              <button class="action-btn delete-btn" type="button" data-id="${congViec.id}">🗑</button>
            </div>
            <button class="detail-link toggle-detail-btn" type="button">⌄ Chi tiet</button>
          </div>
        </div>

        <div class="task-detail">${thoatHtml(congViec.description || "Khong co mo ta.")}</div>
      </article>
    `;
  }).join("");

  capNhatThongKe();
}

function moModal(cheDo, congViec = null) {
  tieuDeModal.textContent = cheDo === "add" ? "Them cong viec" : "Sua cong viec";

  if (cheDo === "add") {
    bieuMauCongViec.reset();
    oMaCongViec.value = "";
    oTrangThaiCongViec.value = "not-started";
    oMucUuTienCongViec.value = "medium";
    oHanCongViec.value = layNgayHomNay();
  } else if (congViec) {
    oMaCongViec.value = congViec.id;
    oTenCongViec.value = congViec.title;
    oMoTaCongViec.value = congViec.description || "";
    oTrangThaiCongViec.value = congViec.status;
    oMucUuTienCongViec.value = congViec.priority;
    oHanCongViec.value = congViec.dueDate;
  }

  nenModal.classList.add("show");
}

function dongModal() {
  nenModal.classList.remove("show");
  bieuMauCongViec.reset();
  oMaCongViec.value = "";
}

async function themCongViec(duLieu) {
  const phanHoi = await fetch(DUONG_DAN_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(duLieu)
  });

  const ketQua = await phanHoi.json();
  if (!phanHoi.ok) throw new Error(ketQua.message || "Khong them duoc cong viec.");
  return ketQua;
}

async function suaCongViec(maCongViec, duLieu) {
  const phanHoi = await fetch(`${DUONG_DAN_API}/${maCongViec}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(duLieu)
  });

  const ketQua = await phanHoi.json();
  if (!phanHoi.ok) throw new Error(ketQua.message || "Khong sua duoc cong viec.");
  return ketQua;
}

async function xoaCongViec(maCongViec) {
  const phanHoi = await fetch(`${DUONG_DAN_API}/${maCongViec}`, { method: "DELETE" });
  const ketQua = await phanHoi.json();
  if (!phanHoi.ok) throw new Error(ketQua.message || "Khong xoa duoc cong viec.");
  return ketQua;
}

async function lamMoiGiaoDien() {
  await taiDanhSachCongViec();
  hienThiDanhSach();
}

nutMoThemModal.addEventListener("click", () => moModal("add"));
nutDongModal.addEventListener("click", dongModal);
nutHuyModal.addEventListener("click", dongModal);

nenModal.addEventListener("click", (suKien) => {
  if (suKien.target === nenModal) dongModal();
});

bieuMauCongViec.addEventListener("submit", async (suKien) => {
  suKien.preventDefault();

  const maCongViec = oMaCongViec.value;
  const duLieu = {
    title: oTenCongViec.value.trim(),
    description: oMoTaCongViec.value.trim(),
    status: oTrangThaiCongViec.value,
    priority: oMucUuTienCongViec.value,
    dueDate: oHanCongViec.value
  };

  try {
    if (maCongViec) {
      await suaCongViec(maCongViec, duLieu);
    } else {
      await themCongViec(duLieu);
    }

    dongModal();
    await lamMoiGiaoDien();
  } catch (loi) {
    alert(loi.message);
  }
});

oTimKiem.addEventListener("input", hienThiDanhSach);
locTrangThai.addEventListener("change", hienThiDanhSach);
locMucUuTien.addEventListener("change", hienThiDanhSach);

nutMoBoLoc.addEventListener("click", () => {
  bangBoLoc.classList.toggle("show");
});

nutDatLaiBoLoc.addEventListener("click", () => {
  oTimKiem.value = "";
  locTrangThai.value = "all";
  locMucUuTien.value = "all";
  tabHienTai = "all";

  danhSachTab.forEach((tab) => tab.classList.remove("active"));
  document.querySelector('[data-tab="all"]').classList.add("active");

  hienThiDanhSach();
});

danhSachTab.forEach((tab) => {
  tab.addEventListener("click", () => {
    danhSachTab.forEach((phanTu) => phanTu.classList.remove("active"));
    tab.classList.add("active");
    tabHienTai = tab.dataset.tab;
    hienThiDanhSach();
  });
});

danhSachCongViecUI.addEventListener("click", async (suKien) => {
  const nutSua = suKien.target.closest(".edit-btn");
  const nutXoa = suKien.target.closest(".delete-btn");
  const nutChiTiet = suKien.target.closest(".toggle-detail-btn");

  if (nutSua) {
    const maCongViec = nutSua.dataset.id;
    const congViec = danhSachCongViec.find((cv) => cv.id === maCongViec);
    if (congViec) moModal("edit", congViec);
    return;
  }

  if (nutXoa) {
    const maCongViec = nutXoa.dataset.id;
    const congViec = danhSachCongViec.find((cv) => cv.id === maCongViec);
    if (!congViec) return;

    const xacNhan = confirm(`Ban co chac muon xoa cong viec "${congViec.title}" khong?`);
    if (!xacNhan) return;

    try {
      await xoaCongViec(maCongViec);
      await lamMoiGiaoDien();
    } catch (loi) {
      alert(loi.message);
    }
    return;
  }

  if (nutChiTiet) {
    const theCard = nutChiTiet.closest(".task-card");
    const noiDungChiTiet = theCard.querySelector(".task-detail");
    const dangMo = noiDungChiTiet.classList.contains("show");

    noiDungChiTiet.classList.toggle("show");
    nutChiTiet.textContent = dangMo ? "⌄ Chi tiet" : "⌃ Chi tiet";
  }
});

lamMoiGiaoDien().catch((loi) => {
  alert(loi.message);
});