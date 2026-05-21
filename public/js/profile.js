// ===== THÔNG TIN CÁ NHÂN (USER PROFILE) =====
let fileAvatarChoUpload = null; // Lưu file avatar chờ upload khi bấm "Lưu thay đổi"
let xoaAvatarChoUpload = false; // Lưu trạng thái xóa avatar

function taiCaNhan() {
  if (!nguoiDungHienTai) return;
  $("cnHoTen").value = nguoiDungHienTai.full_name || "";
  $("cnEmail").value = nguoiDungHienTai.email || "";
  $("cnMoTa").value = nguoiDungHienTai.bio || "";
  fileAvatarChoUpload = null; // Reset file chờ
  xoaAvatarChoUpload = false; // Reset trạng thái xóa
  // Hiển thị avatar
  if (nguoiDungHienTai.avatar_url) {
    $("avatarCaNhan").innerHTML =
      `<img src="${nguoiDungHienTai.avatar_url}" alt="Avatar" />`;
    if ($("nutXoaAvatar")) $("nutXoaAvatar").style.display = "inline-block";
  } else {
    $("avatarCaNhan").textContent = (nguoiDungHienTai.full_name || "U")
      .charAt(0)
      .toUpperCase();
    if ($("nutXoaAvatar")) $("nutXoaAvatar").style.display = "none";
  }
}

$("formCaNhan").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("loiCaNhan").textContent = "";
  try {
    // Nếu có ảnh chờ xóa, xóa trước
    if (xoaAvatarChoUpload) {
      const resAvatar = await fetch(
        API + "/users/" + nguoiDungHienTai.user_id + "/avatar",
        {
          method: "DELETE",
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        },
      );
      const dataAvatar = await resAvatar.json();
      if (!resAvatar.ok) throw new Error(dataAvatar.message || "Lỗi xóa ảnh.");
      nguoiDungHienTai.avatar_url = null;
      xoaAvatarChoUpload = false;
    }
    // Nếu có ảnh chờ upload, upload trước
    else if (fileAvatarChoUpload) {
      const formData = new FormData();
      formData.append("avatar", fileAvatarChoUpload);
      const resAvatar = await fetch(
        API + "/users/" + nguoiDungHienTai.user_id + "/avatar",
        {
          method: "POST",
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
          body: formData,
        },
      );
      const dataAvatar = await resAvatar.json();
      if (!resAvatar.ok) throw new Error(dataAvatar.message || "Lỗi tải ảnh.");
      // Cập nhật avatar_url vào state
      nguoiDungHienTai.avatar_url =
        dataAvatar.nguoiDung?.avatar_url || nguoiDungHienTai.avatar_url;
      fileAvatarChoUpload = null;
    }

    // Lưu thông tin cá nhân
    const kq = await goiAPI("/users/" + nguoiDungHienTai.user_id, {
      method: "PUT",
      body: { full_name: $("cnHoTen").value, bio: $("cnMoTa").value },
    });
    nguoiDungHienTai = {
      ...nguoiDungHienTai,
      ...(kq.nguoiDung || kq.user || { full_name: $("cnHoTen").value }),
    };
    localStorage.setItem("nguoiDung", JSON.stringify(nguoiDungHienTai));
    capNhatThongTinNguoiDung();
    taiCaNhan();
    hienToast("Đã cập nhật thông tin!", "success");
  } catch (l) {
    $("loiCaNhan").textContent = l.message;
  }
});

$("formDoiMatKhau").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("loiDoiMK").textContent = "";
  if ($("mkMoi").value !== $("mkXacNhan").value) {
    $("loiDoiMK").textContent = "Mật khẩu xác nhận không khớp.";
    return;
  }
  try {
    await goiAPI("/users/" + nguoiDungHienTai.user_id + "/password", {
      method: "PUT",
      body: {
        current_password: $("mkHienTai").value,
        new_password: $("mkMoi").value,
      },
    });
    hienToast("Đổi mật khẩu thành công!", "success");
    $("formDoiMatKhau").reset();
  } catch (l) {
    $("loiDoiMK").textContent = l.message;
  }
});

// ===== CHỌN AVATAR (CHỈ PREVIEW, CHƯA UPLOAD) =====
$("nutChonAvatar")?.addEventListener("click", () => $("inputAvatar").click());
$("avatarCaNhan")?.addEventListener("click", () => $("inputAvatar").click());

$("inputAvatar")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Kiểm tra dung lượng
  if (file.size > 2 * 1024 * 1024) {
    hienToast("Ảnh quá lớn! Tối đa 2MB.", "error");
    e.target.value = "";
    return;
  }

  // Lưu file chờ upload và hiển thị preview
  fileAvatarChoUpload = file;
  xoaAvatarChoUpload = false;
  const previewUrl = URL.createObjectURL(file);
  $("avatarCaNhan").innerHTML = `<img src="${previewUrl}" alt="Preview" />`;
  if ($("nutXoaAvatar")) $("nutXoaAvatar").style.display = "inline-block";
  hienToast('Đã chọn ảnh. Bấm "Lưu thay đổi" để cập nhật.', "");
});

$("nutXoaAvatar")?.addEventListener("click", () => {
  xoaAvatarChoUpload = true;
  fileAvatarChoUpload = null;
  $("avatarCaNhan").textContent = (nguoiDungHienTai.full_name || "U")
    .charAt(0)
    .toUpperCase();
  $("nutXoaAvatar").style.display = "none";
  if ($("inputAvatar")) $("inputAvatar").value = "";
  hienToast('Đã gỡ ảnh. Bấm "Lưu thay đổi" để cập nhật.', "");
});
