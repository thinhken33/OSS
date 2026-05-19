// ===== QUẢN LÝ THÔNG BÁO (NOTIFICATION MANAGEMENT) =====
async function taiThongBao() {
  if (!nguoiDungHienTai) return;
  try {
    const ds = await goiAPI("/notifications");
    const el = $("danhSachThongBao"),
      rong = $("rongThongBao");

    if (ds.length > 0) {
      const maxId = Math.max(...ds.map((t) => t.notification_id));
      if (window._latestNotifId !== undefined && maxId > window._latestNotifId) {
        const newNotifs = ds.filter((t) => t.notification_id > window._latestNotifId);
        if (newNotifs.length > 0) {
          hienToast(`🔔 Có thông báo mới: ${newNotifs[0].message}`, "info");
        }
      }
      window._latestNotifId = maxId;
    }

    if (!ds.length) {
      el.innerHTML = "";
      rong.classList.add("show");
      badgeThongBao(0);
      return;
    }
    rong.classList.remove("show");
    el.innerHTML = ds
      .map(
        (tb) => `
      <div class="tb-card ${tb.is_read ? "" : "unread"}">
        <span class="tb-icon">${tb.is_read ? "📭" : "📬"}</span>
        <div class="tb-content">
          <div class="tb-message">${thoatHtml(tb.message)}</div>
          <div class="tb-time">${new Date(tb.created_at).toLocaleString("vi-VN")}</div>
        </div>
        <div class="tb-actions">
          ${!tb.is_read ? `<button class="btn-sm btn-secondary" onclick="docThongBao(${tb.notification_id})">Đọc</button>` : ""}
          <button class="btn-sm btn-danger" onclick="xoaThongBaoUI(${tb.notification_id})">Xóa</button>
        </div>
      </div>
    `,
      )
      .join("");

    const chuaDoc = ds.filter((t) => !t.is_read).length;
    badgeThongBao(chuaDoc);
  } catch {
    /* bo qua */
  }
}

function badgeThongBao(chuaDoc) {
  const badge = $("badgeThongBao");
  if (chuaDoc > 0) {
    badge.textContent = chuaDoc;
    badge.style.display = "inline";
  } else {
    badge.style.display = "none";
  }
}

async function docThongBao(id) {
  try {
    await goiAPI("/notifications/" + id + "/read", { method: "PATCH" });
    await taiThongBao();
  } catch (l) {
    hienToast(l.message, "error");
  }
}

async function xoaThongBaoUI(id) {
  try {
    await goiAPI("/notifications/" + id, {
      method: "DELETE",
    });
    hienToast("Đã xóa thông báo!", "success");
    await taiThongBao();
  } catch (l) {
    hienToast(l.message, "error");
  }
}

$("nutDocTatCa").addEventListener("click", async () => {
  if (!nguoiDungHienTai) return;
  try {
    await goiAPI("/notifications/read-all", { method: "PATCH" });
    hienToast("Đã đọc tất cả!", "success");
    await taiThongBao();
  } catch (l) {
    hienToast(l.message, "error");
  }
});

$("nutXoaTatCaThongBao").addEventListener("click", async () => {
  if (!nguoiDungHienTai) return;
  if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ thông báo không? Hành động này không thể hoàn tác.")) return;
  try {
    await goiAPI("/notifications", { method: "DELETE" });
    hienToast("Đã xóa tất cả thông báo!", "success");
    await taiThongBao();
  } catch (l) {
    hienToast(l.message, "error");
  }
});

// Thông báo nhắc việc được tạo tự động sau khi lưu công việc — không cần nút thủ công

