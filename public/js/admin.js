// ===== CHỨC NĂNG QUẢN TRỊ (ADMIN PANEL) =====
let danhSachNguoiDungAdmin = [];

async function taiQuanTri() {
  if (!nguoiDungHienTai || nguoiDungHienTai.role !== "admin") return;
  try {
    danhSachNguoiDungAdmin = await goiAPI("/users");
    capNhatThongKeAdmin();
    hienThiDanhSachNguoiDung();
  } catch (l) {
    hienToast(l.message, "error");
  }
}

function capNhatThongKeAdmin() {
  const ds = danhSachNguoiDungAdmin;
  $("adminTotalUsers").textContent = ds.length;
  $("adminActiveUsers").textContent = ds.filter((nd) => !nd.is_locked).length;
  $("adminLockedUsers").textContent = ds.filter((nd) => nd.is_locked).length;
  $("adminAdminCount").textContent = ds.filter(
    (nd) => nd.role === "admin",
  ).length;
}

function locNguoiDungAdmin() {
  const tuKhoa = ($("adminSearchInput").value || "").trim().toLowerCase();
  const vaiTro = $("adminRoleFilter").value;
  const trangThai = $("adminStatusFilter").value;

  return danhSachNguoiDungAdmin.filter((nd) => {
    const khopTuKhoa =
      !tuKhoa ||
      (nd.full_name || "").toLowerCase().includes(tuKhoa) ||
      (nd.email || "").toLowerCase().includes(tuKhoa);
    const khopVaiTro = vaiTro === "all" || nd.role === vaiTro;
    const khopTrangThai =
      trangThai === "all" ||
      (trangThai === "active" && !nd.is_locked) ||
      (trangThai === "locked" && nd.is_locked);
    return khopTuKhoa && khopVaiTro && khopTrangThai;
  });
}

function hienThiDanhSachNguoiDung() {
  const ds = locNguoiDungAdmin();
  const el = $("danhSachNguoiDung");
  const rong = $("rongQuanTri");

  if (!ds.length) {
    el.innerHTML = "";
    rong.style.display = "block";
    rong.classList.add("show");
    return;
  }
  rong.style.display = "none";
  rong.classList.remove("show");

  el.innerHTML = ds
    .map((nd) => {
      const chuCai = (nd.full_name || "?").charAt(0).toUpperCase();
      const ngayTao = nd.created_at
        ? new Date(nd.created_at).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "—";
      const laAdmin = nd.role === "admin";
      const laBanThan = nd.user_id === nguoiDungHienTai.user_id;

      return `<tr>
      <td><strong>#${nd.user_id}</strong></td>
      <td>
        <div class="admin-user-cell">
          <div class="admin-user-avatar">${chuCai}</div>
          <span class="admin-user-name">${thoatHtml(nd.full_name)}</span>
        </div>
      </td>
      <td>${thoatHtml(nd.email)}</td>
      <td><span class="pill ${laAdmin ? "blue" : "gray"}">${laAdmin ? "Admin" : "Người dùng"}</span></td>
      <td><span class="pill ${nd.is_locked ? "red" : "green"}">${nd.is_locked ? "Đã khóa" : "Hoạt động"}</span></td>
      <td>${ngayTao}</td>
      <td>
        <div class="action-group">
          <button class="btn-sm btn-view" onclick="xemChiTietNguoiDung(${nd.user_id})">👁 Xem</button>
          ${
            laBanThan
              ? '<em style="font-size:12px;color:#999;">Bạn</em>'
              : `
            <button class="btn-sm ${nd.is_locked ? "btn-success" : "btn-danger"}" onclick="khoaMoKhoa(${nd.user_id},${!nd.is_locked})">
              ${nd.is_locked ? "🔓 Mở" : "🔒 Khóa"}
            </button>
            <button class="btn-sm btn-delete" onclick="xoaNguoiDungUI(${nd.user_id},'${thoatHtml(nd.full_name)}')">🗑</button>
          `
          }
        </div>
      </td>
    </tr>`;
    })
    .join("");
}

// Xem chi tiết người dùng
window.xemChiTietNguoiDung = function (userId) {
  const nd = danhSachNguoiDungAdmin.find((u) => u.user_id === userId);
  if (!nd) return;
  const chuCai = (nd.full_name || "?").charAt(0).toUpperCase();
  const ngayTao = nd.created_at
    ? new Date(nd.created_at).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  $("userDetailContent").innerHTML = `
    <div class="user-detail-grid">
      <div class="user-detail-header">
        <div class="user-detail-avatar">${chuCai}</div>
        <div>
          <div class="user-detail-name">${thoatHtml(nd.full_name)}</div>
          <div class="user-detail-email">${thoatHtml(nd.email)}</div>
        </div>
      </div>
      <div class="user-detail-row">
        <span class="user-detail-label">Mã người dùng</span>
        <span class="user-detail-value"><strong>#${nd.user_id}</strong></span>
      </div>
      <div class="user-detail-row">
        <span class="user-detail-label">Vai trò</span>
        <span class="user-detail-value"><span class="pill ${nd.role === "admin" ? "blue" : "gray"}">${nd.role === "admin" ? "Quản trị viên" : "Người dùng"}</span></span>
      </div>
      <div class="user-detail-row">
        <span class="user-detail-label">Trạng thái</span>
        <span class="user-detail-value"><span class="pill ${nd.is_locked ? "red" : "green"}">${nd.is_locked ? "Đã khóa" : "Hoạt động"}</span></span>
      </div>
      <div class="user-detail-row">
        <span class="user-detail-label">Tiểu sử</span>
        <span class="user-detail-value">${thoatHtml(nd.bio || "Chưa cập nhật")}</span>
      </div>
      <div class="user-detail-row">
        <span class="user-detail-label">Ngày tham gia</span>
        <span class="user-detail-value">${ngayTao}</span>
      </div>
    </div>`;

  $("modalUserDetail").classList.add("show");
};

function dongModalUserDetail() {
  $("modalUserDetail").classList.remove("show");
}
$("closeUserDetail").addEventListener("click", dongModalUserDetail);
$("closeUserDetail2").addEventListener("click", dongModalUserDetail);
$("modalUserDetail").addEventListener("click", (e) => {
  if (e.target === $("modalUserDetail")) dongModalUserDetail();
});

// Khóa / Mở khóa
window.khoaMoKhoa = async function (id, khoa) {
  try {
    await goiAPI("/users/" + id + "/lock", {
      method: "PATCH",
      body: { is_locked: khoa },
    });
    hienToast(khoa ? "Đã khóa tài khoản!" : "Đã mở khóa!", "success");
    await taiQuanTri();
  } catch (l) {
    hienToast(l.message, "error");
  }
};

// Xóa người dùng
window.xoaNguoiDungUI = async function (id, ten) {
  if (
    !confirm(
      'Bạn chắc chắn muốn xóa tài khoản "' +
        ten +
        '"?\n\nHành động này không thể hoàn tác. Tất cả dữ liệu của người dùng (công việc, danh mục, thông báo) sẽ bị xóa vĩnh viễn.',
    )
  )
    return;
  try {
    await goiAPI("/users/" + id, { method: "DELETE" });
    hienToast('Đã xóa tài khoản "' + ten + '"!', "success");
    await taiQuanTri();
  } catch (l) {
    hienToast(l.message, "error");
  }
};

// Event listeners cho bộ lọc admin
$("adminSearchInput")?.addEventListener("input", hienThiDanhSachNguoiDung);
$("adminRoleFilter")?.addEventListener("change", hienThiDanhSachNguoiDung);
$("adminStatusFilter")?.addEventListener("change", hienThiDanhSachNguoiDung);
