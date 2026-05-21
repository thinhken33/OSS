// ===== CUSTOM DATE-TIME PICKER ENGINE =====
// Mỗi instance DTP quản lý 1 bộ chọn ngày giờ
function taoDateTimePicker(config) {
  // config: { displayId, valId, panelId, hiddenId, allowPast, defaultValue }
  const state = { year: 0, month: 0, selectedDt: null };
  const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const MONTHS = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  const pad = (n) => String(n).padStart(2, "0");

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
    DAYS.forEach((d) => {
      cells += `<div class="dtp-dow">${d}</div>`;
    });
    for (let i = 0; i < startDow; i++)
      cells += `<div class="dtp-empty-cell other-month"></div>`;
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const thisDt = new Date(state.year, state.month, d);
      const isPast = !config.allowPast && thisDt < today;
      const isToday = thisDt.getTime() === today.getTime();
      const isSel =
        selD &&
        thisDt.getFullYear() === selD.getFullYear() &&
        thisDt.getMonth() === selD.getMonth() &&
        thisDt.getDate() === selD.getDate();
      const cls = ["dtp-day", isToday ? "today" : "", isSel ? "selected" : ""]
        .filter(Boolean)
        .join(" ");
      cells +=
        `<button class="${cls}" data-d="${d}" ${isPast ? "disabled" : ""}>` +
        d +
        `</button>`;
    }

    // Thêm các ô trống ở cuối để luôn đủ 6 hàng (42 ô)
    const totalCells = startDow + lastDay.getDate();
    const remaining = 42 - totalCells;
    for (let i = 0; i < remaining; i++) {
      cells += `<div class="dtp-empty-cell other-month"></div>`;
    }

    const curH = selD ? selD.getHours() : 23;
    const curM = selD ? selD.getMinutes() : 59;
    const panId = config.panelId;

    panel.innerHTML = `
      <div class="dtp-cal-head">
        <button type="button" class="dtp-nav" data-nav="-1">&#8249;</button>
        <div class="dtp-head-center">
          <select class="dtp-sel-month">
            ${MONTHS.map((m, i) => `<option value="${i}" ${i === state.month ? "selected" : ""}>${m}</option>`).join("")}
          </select>
          <select class="dtp-sel-year">
            ${(() => {
              let start = 1970;
              let end = 2100;
              if (state.year < start) start = state.year - 10;
              if (state.year > end) end = state.year + 10;
              let opts = "";
              for (let y = start; y <= end; y++) {
                opts += `<option value="${y}" ${y === state.year ? "selected" : ""}>${y}</option>`;
              }
              return opts;
            })()}
          </select>
        </div>
        <button type="button" class="dtp-nav" data-nav="1">&#8250;</button>
      </div>
      <div class="dtp-cal-grid">${cells}</div>
      <div class="dtp-time-block">
        <div class="dtp-time-title">Thời gian</div>
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
      return isNaN(v) || v < 0 || v > 23 ? -1 : v;
    }
    function layM() {
      let v = parseInt($(panId + "_m").value);
      return isNaN(v) || v < 0 || v > 59 ? -1 : v;
    }

    function checkValid() {
      let err = [];
      const hInput = $(panId + "_h");
      const mInput = $(panId + "_m");
      if (layH() === -1) {
        err.push("Giờ (0-23)");
        hInput.classList.add("invalid");
      } else {
        hInput.classList.remove("invalid");
      }
      if (layM() === -1) {
        err.push("Phút (0-59)");
        mInput.classList.add("invalid");
      } else {
        mInput.classList.remove("invalid");
      }
      $(panId + "_err").textContent = err.length
        ? "Sai: " + err.join(", ")
        : "";
      return err.length === 0;
    }

    // Xác thực input khi người dùng nhập tay
    const hInput = $(panId + "_h");
    const mInput = $(panId + "_m");

    // Chặn nhập chữ
    hInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
      checkValid();
    });
    mInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
      checkValid();
    });

    // Tự động bôi đen (select) khi click/focus để dễ gõ đè
    hInput.addEventListener("focus", function () {
      this.select();
    });
    mInput.addEventListener("focus", function () {
      this.select();
    });

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

    hInput.addEventListener("blur", function () {
      formatInput(this, true);
    });
    mInput.addEventListener("blur", function () {
      formatInput(this, false);
    });
    hInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        formatInput(this, true);
      }
    });
    mInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        formatInput(this, false);
      }
    });

    // Sự kiện trong panel — chọn ngày
    panel.querySelectorAll(".dtp-nav").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!checkValid()) return;
        // Cập nhật giờ/phút trước khi re-render
        if (state.selectedDt) state.selectedDt.setHours(layH(), layM(), 0, 0);
        else {
          const d = new Date();
          state.selectedDt = new Date(
            state.year,
            state.month,
            d.getDate(),
            layH(),
            layM(),
          );
        }
        state.month += parseInt(btn.dataset.nav);
        if (state.month < 0) {
          state.month = 11;
          state.year--;
        }
        if (state.month > 11) {
          state.month = 0;
          state.year++;
        }
        hienThiPanel();
      });
    });
    panel.querySelectorAll(".dtp-sel-month, .dtp-sel-year").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        e.stopPropagation();
        if (!checkValid()) return;
        if (sel.classList.contains("dtp-sel-month")) {
          state.month = parseInt(sel.value);
        } else {
          state.year = parseInt(sel.value);
        }
        hienThiPanel();
      });
    });
    panel.querySelectorAll(".dtp-day:not(:disabled)").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!checkValid()) return;
        const d = parseInt(btn.dataset.d);
        state.selectedDt = new Date(
          state.year,
          state.month,
          d,
          layH(),
          layM(),
          0,
        );
        hienThiPanel();
      });
    });
    panel.querySelector("[data-ok]").addEventListener("click", (e) => {
      e.stopPropagation();
      if (!checkValid()) return;
      if (!state.selectedDt) {
        state.selectedDt = new Date(
          state.year,
          state.month,
          new Date().getDate(),
          layH(),
          layM(),
          0,
        );
      } else {
        // Cập nhật cả năm, tháng, ngày hiện tại cùng với giờ phút
        const currentDay = state.selectedDt.getDate();
        state.selectedDt = new Date(
          state.year,
          state.month,
          currentDay,
          layH(),
          layM(),
          0,
        );
      }
      // Nếu không cho phép quá khứ, kiểm tra thời điểm đã chọn
      if (!config.allowPast && state.selectedDt <= new Date()) {
        hienToast(
          "⚠️ Hạn hoàn thành phải là thời điểm trong tương lai!",
          "error",
        );
        return;
      }
      dongPicker();
      capNhatGiaTri();
    });
    panel.querySelector("[data-clear]").addEventListener("click", (e) => {
      e.stopPropagation();
      state.selectedDt = null;
      capNhatGiaTri();
      dongPicker();
    });
  }

  function moPanel() {
    const panel = $(config.panelId);
    const disp = $(config.displayId);
    // Đóng tất cả panel khác trước
    document.querySelectorAll(".dtp-panel.open").forEach((p) => {
      if (p.id !== config.panelId) p.classList.remove("open");
    });
    document.querySelectorAll(".dtp-display.open").forEach((d) => {
      if (d.id !== config.displayId) d.classList.remove("open");
    });
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
      const y = state.selectedDt.getFullYear(),
        mo = state.selectedDt.getMonth() + 1,
        d = state.selectedDt.getDate();
      const h = state.selectedDt.getHours(),
        m = state.selectedDt.getMinutes();
      valEl.innerHTML = `<strong>${pad(d)}/${pad(mo)}/${y}</strong>&nbsp;&nbsp;⏰ ${pad(h)}:${pad(m)}`;
      hiddenEl.value = `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(m)}`;
    } else {
      valEl.innerHTML = `<span class="dtp-placeholder">${config.placeholder || "Chưa chọn"}</span>`;
      hiddenEl.value = "";
    }
    if (config.onChange) config.onChange(state.selectedDt);
  }

  function datGiaTri(isoStr) {
    if (!isoStr) {
      state.selectedDt = null;
      capNhatGiaTri();
      return;
    }
    const d = new Date(isoStr);
    if (!isNaN(d)) {
      state.selectedDt = d;
      capNhatGiaTri();
    }
  }

  // Gắn sự kiện
  const display = $(config.displayId);
  const panelEl = $(config.panelId);
  display.addEventListener("click", (e) => {
    e.stopPropagation();
    moPanel();
  });
  display.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      moPanel();
    }
  });
  panelEl.addEventListener("click", (e) => e.stopPropagation());

  return { datGiaTri, dongPicker, layGiaTri: () => state.selectedDt };
}

// Khởi tạo 2 picker cho modal
let dtpStart = null,
  dtpDue = null;

function khoiTaoPicker() {
  if (dtpStart) return; // chỉ khởi tạo 1 lần
  dtpStart = taoDateTimePicker({
    displayId: "dtpStartDisplay",
    valId: "dtpStartVal",
    panelId: "dtpStartPanel",
    hiddenId: "taskStartDate",
    allowPast: true,
    placeholder: "Chưa chọn",
  });
  dtpDue = taoDateTimePicker({
    displayId: "dtpDueDisplay",
    valId: "dtpDueVal",
    panelId: "dtpDuePanel",
    hiddenId: "taskDueDate",
    allowPast: false,
    placeholder: "Bắt buộc chọn",
  });
  // Đóng picker khi click ngoài
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dtp-panel.open")
      .forEach((p) => p.classList.remove("open"));
    document
      .querySelectorAll(".dtp-display.open")
      .forEach((d) => d.classList.remove("open"));
  });
}
