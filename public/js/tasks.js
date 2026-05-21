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
function laQuaHan(cv) {
  return (
    cv.status === "pending" && cv.due_date && new Date(cv.due_date) < new Date()
  );
}

function layTrangThaiFE(cv) {
  if (cv.status === "completed") return "completed";
  if (laQuaHan(cv)) return "overdue";
  return statusToFE(cv.status) || "not-started";
}

// Logic riêng cho hiển thị Tag (Nhãn) để xử lý logic "đã qua ngày bắt đầu nhưng chưa làm"
function layNhanTrangThaiFE(cv) {
  if (cv.status === "completed") return "completed";
  if (laQuaHan(cv)) return "overdue";
  return statusToFE(cv.status) || "not-started";
}

function nhanTrangThai(s) {
  return (
    {
      "not-started": "Cần làm",
      "in-progress": "Đang làm",
      completed: "Hoàn thành",
      overdue: "Quá hạn",
    }[s] || s
  );
}
function nhanUuTien(p) {
  return { low: "Thấp", medium: "Trung bình", high: "Cao" }[p] || p;
}
function lopTrangThai(s) {
  return {
    "not-started": "gray",
    "in-progress": "blue",
    completed: "green",
    overdue: "red",
  }[s];
}
function lopUuTien(p) {
  return { low: "gray", medium: "orange", high: "red" }[p];
}

// Định dạng ngày giờ đầy đủ theo locale Việt Nam
function dinhDangNgay(d) {
  if (!d) return "Không có hạn";
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function nhanNgay(cv) {
  if (!cv.due_date) return "Không có hạn";
  const han = new Date(cv.due_date);
  const homNay = new Date();
  if (han.toDateString() === homNay.toDateString())
    return (
      "Hôm nay lúc " +
      han.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );
  return dinhDangNgay(cv.due_date);
}

async function taiCongViec() {
  try {
    if (!nguoiDungHienTai) return;
    danhSachCongViec = await goiAPI("/tasks");
  } catch {
    danhSachCongViec = [];
  }
  hienThiCongViec();
}

function capNhatSoDem() {
  const dem = {
    all: danhSachCongViec.length,
    "not-started": 0,
    "in-progress": 0,
    completed: 0,
    overdue: 0,
  };
  danhSachCongViec.forEach((cv) => {
    dem[layTrangThaiFE(cv)] = (dem[layTrangThaiFE(cv)] || 0) + 1;
  });
  document.querySelectorAll(".tab").forEach((t) => {
    const k = t.dataset.tab;
    t.querySelector("span").textContent = dem[k] || 0;
  });
}

function locCongViec() {
  const tk = ($("searchInput").value || "").trim().toLowerCase();
  const st = $("statusFilter").value;
  const pr = $("priorityFilter").value;
  const dm = $("categoryFilter").value;
  return danhSachCongViec.filter((cv) => {
    const tt = layTrangThaiFE(cv);
    return (
      (tabHienTai === "all" || tt === tabHienTai) &&
      (st === "all" || tt === st) &&
      (pr === "all" || cv.priority === pr) &&
      (dm === "all" || String(cv.category_id) === dm) &&
      (cv.title.toLowerCase().includes(tk) ||
        (cv.description || "").toLowerCase().includes(tk))
    );
  });
}

function taoHTMLTaskCard(cv) {
  const ttFE = layTrangThaiFE(cv);
  const ttNhan = layNhanTrangThaiFE(cv);
  const lngay = ttFE === "overdue" ? "date red-text" : "date";
  let badgeSapDenHan = "";
  if (cv.status !== "completed" && cv.due_date) {
    const due = new Date(cv.due_date);
    const now = new Date();
    const diffHours = (due - now) / (1000 * 60 * 60);
    if (diffHours > 0 && diffHours <= 12) {
      badgeSapDenHan = `<span class="pill orange">🔥 Sắp đến hạn</span>`;
    }
  }

  return `<article class="task-card ${ttFE === "overdue" ? "overdue" : ""}" draggable="true" data-id="${cv.task_id}">
    <div class="task-row"><div class="task-left">
      <button class="task-checkbox ${cv.status === "completed" ? "checked" : ""}" data-id="${cv.task_id}" data-status="${cv.status === "completed" ? "pending" : "completed"}" title="Đánh dấu hoàn thành">
         ${cv.status === "completed" ? "✔" : ""}
      </button>
      <div class="task-content"><div class="task-title">${thoatHtml(cv.title)}</div>
        <div class="task-meta">
          <span class="pill ${lopTrangThai(ttNhan)}">${nhanTrangThai(ttNhan)}</span>
          <span class="pill ${lopUuTien(cv.priority)}">${nhanUuTien(cv.priority)}</span>
          ${badgeSapDenHan}
          <span class="${lngay}">📅 ${nhanNgay(cv)}</span>
          ${cv.category_name ? `<span class="pill purple">${thoatHtml(cv.category_name)}</span>` : ""}
        </div></div></div>
      <div class="task-actions"><div class="action-icons">
        <button class="action-btn edit-btn" data-id="${cv.task_id}" title="Chỉnh sửa">✎</button>
        <button class="action-btn delete-btn" data-id="${cv.task_id}" title="Xóa">🗑</button>
      </div><button class="detail-link toggle-detail-btn">📝 Mô tả</button></div>
    </div>
    <div class="task-detail">
      <div class="td-desc">${thoatHtml(cv.description || "Không có nội dung mô tả.")}</div>
    </div>
  </article>`;
}

let currentViewMode = "list"; // list | board

function hienThiCongViec() {
  const ds = locCongViec().sort((a, b) => {
    const pA = { high: 3, medium: 2, low: 1 }[a.priority] || 0;
    const pB = { high: 3, medium: 2, low: 1 }[b.priority] || 0;
    if (pA !== pB) return pB - pA;
    return new Date(a.due_date || "9999") - new Date(b.due_date || "9999");
  });

  if ($("focusModeContainer")) {
    $("focusModeContainer").style.display = "none";
  }

  capNhatSoDem();

  if (currentViewMode === "list") {
    const el = $("taskList");
    if (!ds.length) {
      el.innerHTML = "";
      $("emptyState").classList.add("show");
      return;
    }
    $("emptyState").classList.remove("show");
    el.innerHTML = ds.map(taoHTMLTaskCard).join("");
  } else {
    // Kanban Board View
    $("emptyState").classList.remove("show");

    // Gom nhóm an toàn: Nếu db trả về overdue hoặc giá trị lạ, cho vào cột Chưa bắt đầu
    const dsPending = ds.filter(
      (cv) =>
        cv.status === "pending" ||
        cv.status === "overdue" ||
        !["pending", "in_progress", "completed"].includes(cv.status),
    );
    const dsInProgress = ds.filter((cv) => cv.status === "in_progress");
    const dsCompleted = ds.filter((cv) => cv.status === "completed");

    $("kListPending").innerHTML = dsPending.map(taoHTMLTaskCard).join("");
    $("kListInProgress").innerHTML = dsInProgress.map(taoHTMLTaskCard).join("");
    $("kListCompleted").innerHTML = dsCompleted.map(taoHTMLTaskCard).join("");

    $("kCountPending").textContent = dsPending.length;
    $("kCountInProgress").textContent = dsInProgress.length;
    $("kCountCompleted").textContent = dsCompleted.length;
  }
}

function moModalCongViec(cheDo, cv = null) {
  $("modalTitle").textContent =
    cheDo === "add" ? "Thêm công việc" : "Sửa công việc";
  const f = $("taskForm");
  khoiTaoPicker();

  if (cheDo === "add") {
    f.reset();
    $("taskId").value = "";
    $("taskStatus").value = "pending";
    $("taskPriority").value = "medium";
    $("taskCategory").value = "";
    $("enableNotification").checked = false;
    $("customNotificationWrap").style.display = "none";
    $("notificationList").innerHTML = "";
    if ($("descCharCounter")) $("descCharCounter").textContent = "0/5000 ký tự";
    // Mặc định ngày bắt đầu là thời điểm hiện tại, hạn là hôm nay 23:59
    const thoiDiemTao = new Date();
    const mac_dinh = new Date();
    mac_dinh.setHours(23, 59, 0, 0);
    dtpStart.datGiaTri(thoiDiemTao.toISOString());
    dtpDue.datGiaTri(mac_dinh.toISOString());
  } else if (cv) {
    $("taskId").value = cv.task_id;
    $("taskTitle").value = cv.title;
    $("taskDescription").value = cv.description || "";
    if ($("descCharCounter"))
      $("descCharCounter").textContent =
        `${$("taskDescription").value.length}/5000 ký tự`;
    $("taskStatus").value = cv.status; // giữ status gốc từ BE
    $("taskPriority").value = cv.priority;
    $("taskCategory").value = cv.category_id || "";
    dtpStart.datGiaTri(cv.start_date || "");
    dtpDue.datGiaTri(cv.due_date || "");

    // Khôi phục thời gian thông báo
    $("enableNotification").checked = false;
    $("customNotificationWrap").style.display = "none";
    $("notificationList").innerHTML = "";

    if (
      cv.notification_times &&
      Array.isArray(cv.notification_times) &&
      cv.notification_times.length > 0
    ) {
      $("enableNotification").checked = true;
      $("customNotificationWrap").style.display = "flex";
      const ddt = new Date(cv.due_date);
      const sdt = cv.start_date ? new Date(cv.start_date) : null;

      cv.notification_times.forEach((nt) => {
        const ndt = new Date(nt);
        const diffMs = ddt - ndt;
        const diffMin = Math.round(diffMs / 60000);
        let val = 0,
          unit = "m",
          ref = "due";

        let matched = false;
        if (sdt) {
          const diffMsStart = sdt - ndt;
          if (diffMsStart >= 0) {
            const dMinS = Math.round(diffMsStart / 60000);
            const dHoursS = Math.round(diffMsStart / 3600000);
            const dDaysS = Math.round(diffMsStart / 86400000);

            ref = "start";
            if (dDaysS > 0 && dDaysS % 30 === 0) {
              val = dDaysS / 30;
              unit = "M";
              matched = true;
            } else if (dDaysS > 0 && dDaysS % 7 === 0) {
              val = dDaysS / 7;
              unit = "w";
              matched = true;
            } else if (dHoursS > 0 && dHoursS % 24 === 0) {
              val = dHoursS / 24;
              unit = "d";
              matched = true;
            } else if (dMinS > 0 && dMinS % 60 === 0) {
              val = dMinS / 60;
              unit = "h";
              matched = true;
            } else if (dMinS > 0) {
              val = dMinS;
              unit = "m";
              matched = true;
            }
          }
        }

        if (!matched) {
          ref = "due";
          const diffDays = Math.round(diffMs / 86400000);
          const diffHours = Math.round(diffMs / 3600000);

          if (diffDays > 0 && diffDays % 30 === 0) {
            val = diffDays / 30;
            unit = "M";
          } else if (diffDays > 0 && diffDays % 7 === 0) {
            val = diffDays / 7;
            unit = "w";
          } else if (diffHours > 0 && diffHours % 24 === 0) {
            val = diffHours / 24;
            unit = "d";
          } else if (diffMin > 0 && diffMin % 60 === 0) {
            val = diffMin / 60;
            unit = "h";
          } else {
            val = diffMin > 0 ? diffMin : 0;
            unit = "m";
          }
        }

        $("notificationList").insertAdjacentHTML(
          "beforeend",
          createNotificationHTML(val, unit, ref),
        );
      });
    }
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
  if (dtpStart) {
    dtpStart.datGiaTri("");
    dtpDue.datGiaTri("");
  }
}

$("enableNotification").addEventListener("change", (e) => {
  $("customNotificationWrap").style.display = e.target.checked
    ? "flex"
    : "none";
  if (e.target.checked && $("notificationList").children.length === 0) {
    $("notificationList").insertAdjacentHTML(
      "beforeend",
      createNotificationHTML("", "m", "due"),
    );
  }
});

if ($("btnAddNotification")) {
  $("btnAddNotification").addEventListener("click", () => {
    $("notificationList").insertAdjacentHTML(
      "beforeend",
      createNotificationHTML("", "m", "due"),
    );
  });
}

function createNotificationHTML(val = "", unit = "m", ref = "due") {
  return `
    <div class="notif-item" style="display: flex; flex-direction: column; gap: 6px; border: 1px solid #ddd; padding: 10px; border-radius: 6px; background: #fff; position: relative;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div style="display: flex; flex-direction: column; gap: 4px">
          <label style="font-size: 12px; color: #555">Nhắc trước (số)</label>
          <input type="number" class="notif-val" min="1" value="${val}" placeholder="VD: 3, 10..." style="padding: 6px; border: 1px solid var(--line); border-radius: 4px;" required />
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px">
          <label style="font-size: 12px; color: #555">Đơn vị</label>
          <select class="notif-unit" style="padding: 6px; border: 1px solid var(--line); border-radius: 4px;">
            <option value="m" ${unit === "m" ? "selected" : ""}>Phút</option>
            <option value="h" ${unit === "h" ? "selected" : ""}>Giờ</option>
            <option value="d" ${unit === "d" ? "selected" : ""}>Ngày</option>
            <option value="w" ${unit === "w" ? "selected" : ""}>Tuần</option>
            <option value="M" ${unit === "M" ? "selected" : ""}>Tháng</option>
          </select>
        </div>
      </div>
      <div style="display: flex; align-items: flex-end; gap: 8px; margin-top: 4px;">
        <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
          <label style="font-size: 12px; color: #555">Mốc thời gian</label>
          <select class="notif-ref" style="padding: 6px; border: 1px solid var(--line); border-radius: 4px;">
            <option value="due" ${ref === "due" ? "selected" : ""}>Hạn hoàn thành</option>
            <option value="start" ${ref === "start" ? "selected" : ""}>Ngày bắt đầu</option>
          </select>
        </div>
        <button type="button" class="btn-danger btn-sm" onclick="this.closest('.notif-item').remove()" style="padding: 6px 10px;">Xóa</button>
      </div>
    </div>
  `;
}

$("openAddModal").addEventListener("click", () => moModalCongViec("add"));
$("closeModal").addEventListener("click", dongModal);
$("cancelModal").addEventListener("click", dongModal);

// Auto-resize ô mô tả khi người dùng gõ
$("taskDescription").addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
  if ($("descCharCounter")) {
    $("descCharCounter").textContent = `${this.value.length}/5000 ký tự`;
  }
});

$("modalBackdrop").addEventListener("click", (e) => {
  if (e.target === $("modalBackdrop")) dongModal();
});

$("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("taskId").value;

  const startDate = $("taskStartDate").value; // "YYYY-MM-DDTHH:MM"
  const dueDate = $("taskDueDate").value;

  // Kiểm tra bắt buộc có ngày bắt đầu và hạn hoàn thành
  if (!startDate) {
    hienToast("Vui lòng chọn ngày bắt đầu!", "error");
    return;
  }
  if (!dueDate) {
    hienToast("Vui lòng chọn hạn hoàn thành!", "error");
    return;
  }

  // Không cho thêm công việc có hạn trong quá khứ (chỉ kiểm tra khi tạo mới)
  if (!id && new Date(dueDate) < new Date()) {
    hienToast("⚠️ Không thể tạo công việc đã quá hạn!", "error");
    return;
  }

  if (startDate && dueDate && startDate > dueDate) {
    hienToast("Ngày bắt đầu không được lớn hơn hạn hoàn thành!", "error");
    return;
  }

  // Tính toán notification_times
  const notifTimes = [];
  if (dueDate && $("enableNotification").checked) {
    document.querySelectorAll(".notif-item").forEach((item) => {
      const valInput = item.querySelector(".notif-val").value;
      if (!valInput) return;
      const val = parseInt(valInput);
      const unit = item.querySelector(".notif-unit").value;
      const ref = item.querySelector(".notif-ref").value;
      const baseDateStr = ref === "start" ? startDate : dueDate;

      if (baseDateStr) {
        const baseDdt = new Date(baseDateStr);
        if (unit === "m") baseDdt.setMinutes(baseDdt.getMinutes() - val);
        else if (unit === "h") baseDdt.setHours(baseDdt.getHours() - val);
        else if (unit === "d") baseDdt.setDate(baseDdt.getDate() - val);
        else if (unit === "w") baseDdt.setDate(baseDdt.getDate() - val * 7);
        else if (unit === "M") baseDdt.setMonth(baseDdt.getMonth() - val);

        const pad = (n) => String(n).padStart(2, "0");
        notifTimes.push(
          `${baseDdt.getFullYear()}-${pad(baseDdt.getMonth() + 1)}-${pad(baseDdt.getDate())}T${pad(baseDdt.getHours())}:${pad(baseDdt.getMinutes())}`,
        );
      }
    });
  }
  const uniqueNotifTimes = [...new Set(notifTimes)];

  // Trạng thái luôn do hệ thống tính: tạo mới = pending, sửa giữ nguyên status gốc
  const dl = {
    title: $("taskTitle").value.trim(),
    description: $("taskDescription").value.trim(),
    status: id ? $("taskStatus").value : "pending",
    priority: $("taskPriority").value,
    start_date: startDate || null,
    due_date: dueDate,
    category_id: $("taskCategory").value || null,
    notification_times: uniqueNotifTimes,
  };

  try {
    if (id)
      await goiAPI("/tasks/" + id, {
        method: "PUT",
        body: dl,
      });
    else
      await goiAPI("/tasks", {
        method: "POST",
        body: dl,
      });
    dongModal();
    // Tự động tạo thông báo nhắc việc sau khi lưu
    try {
      await goiAPI("/notifications/reminders", { method: "POST" });
    } catch {}
    await taiCongViec();
    await taiThongBao();
    hienToast(id ? "Đã cập nhật!" : "Đã thêm!", "success");
  } catch (l) {
    hienToast(l.message, "error");
  }
});

$("searchInput").addEventListener("input", hienThiCongViec);
$("statusFilter").addEventListener("change", hienThiCongViec);
$("priorityFilter").addEventListener("change", hienThiCongViec);
$("categoryFilter").addEventListener("change", hienThiCongViec);
$("toggleFilterBtn").addEventListener("click", () =>
  $("filterPanel").classList.toggle("show"),
);
$("resetFilterBtn").addEventListener("click", () => {
  $("searchInput").value = "";
  $("statusFilter").value = "all";
  $("priorityFilter").value = "all";
  $("categoryFilter").value = "all";
  tabHienTai = "all";
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document.querySelector('[data-tab="all"]').classList.add("active");
  hienThiCongViec();
});
document.querySelectorAll(".tab").forEach((t) =>
  t.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    tabHienTai = t.dataset.tab;
    hienThiCongViec();
  }),
);

const xuLyHanhDongTask = async (e) => {
  const nutCheck = e.target.closest(".task-checkbox");
  const nutSua = e.target.closest(".edit-btn"),
    nutXoa = e.target.closest(".delete-btn"),
    nutCT = e.target.closest(".toggle-detail-btn");

  if (nutCheck) {
    const id = nutCheck.dataset.id;
    const nextStatus = nutCheck.dataset.status;
    try {
      await goiAPI(`/tasks/${id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      await taiCongViec();
      hienToast(
        nextStatus === "completed" ? "Đã hoàn thành!" : "Đã mở lại!",
        "success",
      );
    } catch (l) {
      hienToast(l.message, "error");
    }
  }

  if (nutSua) {
    const cv = danhSachCongViec.find(
      (x) => String(x.task_id) === String(nutSua.dataset.id),
    );
    if (cv) moModalCongViec("edit", cv);
  }
  if (nutXoa) {
    const cv = danhSachCongViec.find(
      (x) => String(x.task_id) === String(nutXoa.dataset.id),
    );
    if (!cv) return;
    if (!confirm('Xóa "' + cv.title + '"?')) return;
    try {
      await goiAPI("/tasks/" + cv.task_id, { method: "DELETE" });
      await taiCongViec();
      hienToast("Đã xóa!", "success");
    } catch (l) {
      alert(l.message);
    }
  }
  if (nutCT) {
    const dt = nutCT.closest(".task-card").querySelector(".task-detail");
    const mo = dt.classList.toggle("show");
    nutCT.innerHTML = mo ? "Ẩn mô tả" : "📝 Mô tả";
  }
};

$("taskList").addEventListener("click", xuLyHanhDongTask);
if ($("kanbanBoardContainer"))
  $("kanbanBoardContainer").addEventListener("click", xuLyHanhDongTask);

// VIEW TOGGLES
if ($("btnListView") && $("btnBoardView")) {
  $("btnListView").addEventListener("click", () => {
    currentViewMode = "list";
    $("btnListView").classList.add("active");
    $("btnBoardView").classList.remove("active");
    $("listViewContainer").style.display = "block";
    $("kanbanBoardContainer").style.display = "none";
    $("listTabs").style.display = "flex";
    hienThiCongViec();
  });
  $("btnBoardView").addEventListener("click", () => {
    currentViewMode = "board";
    $("btnBoardView").classList.add("active");
    $("btnListView").classList.remove("active");
    $("listViewContainer").style.display = "none";
    $("kanbanBoardContainer").style.display = "block";
    $("listTabs").style.display = "none";
    hienThiCongViec();
  });
}
