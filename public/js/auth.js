
// ===== XỬ LÝ CHUYỂN TRANG (NAVIGATION) =====
function hienTrang(tenTrang) {
  document.querySelectorAll(".page").forEach((p) => (p.style.display = "none"));
  const trang = $(
    "page" + tenTrang.charAt(0).toUpperCase() + tenTrang.slice(1),
  );
  if (trang) trang.style.display = "block";
  document.querySelectorAll(".menu-item").forEach((m) => {
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

    // Khôi phục trang hiện tại từ localStorage
    const trangLuu = localStorage.getItem("trangHienTai") || "congViec";
    hienTrang(trangLuu);

    // Luôn tải dữ liệu nền
    taiCongViec();
    taiDanhMuc();
    taiThongBao();

    // Tải dữ liệu cụ thể cho trang đang mở (nếu cần)
    if (trangLuu === "thongKe") taiThongKe();
    if (trangLuu === "caNhan") taiCaNhan();
    if (trangLuu === "quanTri") taiQuanTri();
    if (trangLuu === "danhMuc") taiVaHienDanhMuc();

    // Polling: Tự động kiểm tra thông báo nhắc nhở mỗi 30 giây
    if (window._intervalThongBao) clearInterval(window._intervalThongBao);
    window._intervalThongBao = setInterval(async () => {
      if (!nguoiDungHienTai) return;
      try {
        await goiAPI("/notifications/reminders", { method: "POST" });
        await taiThongBao();
      } catch {
        // Bỏ qua lỗi polling
      }
    }, 30000);
  }
}

// ===== XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ (AUTHENTICATION) =====
function capNhatThongTinNguoiDung() {
  if (!nguoiDungHienTai) return;
  const chuCai = (nguoiDungHienTai.full_name || "U").charAt(0).toUpperCase();
  // Sidebar avatar
  if (nguoiDungHienTai.avatar_url) {
    $("avatarSidebar").innerHTML =
      `<img src="${nguoiDungHienTai.avatar_url}" alt="Avatar" />`;
  } else {
    $("avatarSidebar").textContent = chuCai;
  }
  $("tenNguoiDungSidebar").textContent = nguoiDungHienTai.full_name || "User";
  if (nguoiDungHienTai.role === "admin") $("menuAdmin").style.display = "block";
}

// Landing page buttons
$("nutDiDangNhap")?.addEventListener("click", () => hienTrangAuth("login"));
$("nutDiDangKy")?.addEventListener("click", () => hienTrangAuth("register"));
$("nutBatDauNgay")?.addEventListener("click", () => hienTrangAuth("register"));
$("nutVeTrangChu")?.addEventListener("click", (e) => {
  e.preventDefault();
  hienTrangAuth("landing");
});
$("nutVeTrangChu2")?.addEventListener("click", (e) => {
  e.preventDefault();
  hienTrangAuth("landing");
});
$("nutMoDangKy")?.addEventListener("click", (e) => {
  e.preventDefault();
  hienTrangAuth("register");
});
$("nutMoDangNhap")?.addEventListener("click", (e) => {
  e.preventDefault();
  hienTrangAuth("login");
});
$("nutQuenMatKhau")?.addEventListener("click", (e) => {
  e.preventDefault();
  alert("Vui lòng liên hệ quản trị viên để cấp lại mật khẩu!");
});

$("formDangNhap").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("loiDangNhap").textContent = "";
  try {
    const kq = await goiAPI("/users/login", {
      method: "POST",
      body: { email: $("dnEmail").value, password: $("dnMatKhau").value },
    });
    nguoiDungHienTai = kq.nguoiDung || kq.user;
    localStorage.setItem("nguoiDung", JSON.stringify(nguoiDungHienTai));
    if (kq.token) localStorage.setItem("token", kq.token);
    hienTrangAuth("app");
  } catch (loi) {
    $("loiDangNhap").textContent = loi.message;
  }
});

$("formDangKy").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("loiDangKy").textContent = "";
  if ($("dkMatKhau").value !== $("dkXacNhan").value) {
    $("loiDangKy").textContent = "Mật khẩu xác nhận không khớp.";
    return;
  }
  try {
    const resData = await goiAPI("/users/register", {
      method: "POST",
      body: {
        full_name: $("dkHoTen").value,
        email: $("dkEmail").value,
        password: $("dkMatKhau").value,
      },
    });
    // Tự động đăng nhập
    nguoiDungHienTai = resData.nguoiDung || resData.user;
    localStorage.setItem("nguoiDung", JSON.stringify(nguoiDungHienTai));
    if (resData.token) localStorage.setItem("token", resData.token);

    hienToast("Đăng ký thành công!", "success");
    hienTrangAuth("app");
  } catch (loi) {
    $("loiDangKy").textContent = loi.message;
  }
});

$("dkMatKhau").addEventListener("input", (e) => {
  const mk = e.target.value;
  const canhBao = $("canhBaoMatKhau");
  if (!mk) {
    canhBao.style.display = "none";
    return;
  }
  // Đánh giá mật khẩu yếu (dưới 8 ký tự hoặc không đủ chữ số, chữ cái)
  const isWeak = mk.length < 8 || !/[A-Za-z]/.test(mk) || !/[0-9]/.test(mk);
  if (isWeak) {
    canhBao.style.display = "block";
  } else {
    canhBao.style.display = "none";
  }
});

$("nutDangXuat").addEventListener("click", () => {
  // Dừng polling thông báo khi đăng xuất
  if (window._intervalThongBao) {
    clearInterval(window._intervalThongBao);
    window._intervalThongBao = null;
  }
  nguoiDungHienTai = null;
  localStorage.removeItem("nguoiDung");
  localStorage.removeItem("token");
  localStorage.removeItem("trangHienTai");
  $("formDangNhap").reset();
  $("formDangKy").reset();
  hienTrangAuth("landing");
});

// ===== XỬ LÝ SỰ KIỆN MENU SIDEBAR =====
document.querySelectorAll(".menu-item").forEach((nut) => {
  nut.addEventListener("click", () => {
    const trang = nut.dataset.page;
    localStorage.setItem("trangHienTai", trang); // Lưu trang hiện tại
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
  const luu = localStorage.getItem("nguoiDung");
  if (luu) {
    try {
      nguoiDungHienTai = JSON.parse(luu);
      hienTrangAuth("app");
    } catch {
      hienTrangAuth("landing");
    }
  } else {
    hienTrangAuth("landing");
  }
});
