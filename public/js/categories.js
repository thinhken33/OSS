// ===== QUẢN LÝ DANH MỤC (CATEGORY MANAGEMENT) =====
async function taiDanhMuc() {
  try {
    if (!nguoiDungHienTai) return;
    danhSachDanhMuc = await goiAPI("/categories");
    capNhatFilterDanhMuc();
  } catch {
    danhSachDanhMuc = [];
  }
}

function capNhatSelectDanhMuc() {
  const sel = $("taskCategory");
  if (!sel) return;
  const val = sel.value;
  sel.innerHTML = '<option value=""></option>';
  danhSachDanhMuc.forEach((dm) => {
    sel.innerHTML += `<option value="${dm.category_id}">${thoatHtml(dm.name)}</option>`;
  });
  sel.value = val;
}

function capNhatFilterDanhMuc() {
  const sel = $("categoryFilter");
  if (!sel) return;
  const val = sel.value;
  sel.innerHTML = '<option value="all">Tất cả</option>';
  danhSachDanhMuc.forEach((dm) => {
    sel.innerHTML += `<option value="${dm.category_id}">${thoatHtml(dm.name)}</option>`;
  });
  sel.value = val;
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
  el.innerHTML = danhSachDanhMuc
    .map(
      (dm) => `
    <div class="dm-card">
      <span class="dm-card-name">🗂️ ${thoatHtml(dm.name)}</span>
      <div class="dm-card-actions">
        <button class="btn-sm btn-secondary dm-edit-btn" data-id="${dm.category_id}" data-name="${thoatHtml(dm.name)}">Sửa</button>
        <button class="btn-sm btn-danger dm-delete-btn" data-id="${dm.category_id}">Xóa</button>
      </div>
    </div>
  `,
    )
    .join("");
}

$("danhSachDanhMuc").addEventListener("click", (e) => {
  if (e.target.classList.contains("dm-edit-btn")) {
    suaDanhMuc(e.target.dataset.id, e.target.dataset.name);
  } else if (e.target.classList.contains("dm-delete-btn")) {
    xoaDanhMucUI(e.target.dataset.id);
  }
});

$("nutThemDanhMuc").addEventListener("click", () => {
  $("formThemDanhMuc").style.display = "flex";
  $("tenDanhMucMoi").focus();
});
$("nutHuyDanhMuc").addEventListener("click", () => {
  $("formThemDanhMuc").style.display = "none";
  $("tenDanhMucMoi").value = "";
});
$("nutLuuDanhMuc").addEventListener("click", async () => {
  const ten = $("tenDanhMucMoi").value.trim();
  if (!ten) return;
  try {
    await goiAPI("/categories", {
      method: "POST",
      body: { name: ten },
    });
    $("tenDanhMucMoi").value = "";
    $("formThemDanhMuc").style.display = "none";
    hienToast("Đã tạo danh mục!", "success");
    await taiVaHienDanhMuc();
  } catch (l) {
    hienToast(l.message, "error");
  }
});

// --- MODAL SỬA DANH MỤC ---
function suaDanhMuc(id, tenCu) {
  $("editCategoryId").value = id;
  $("editCategoryName").value = tenCu;
  $("modalEditCategory").style.display = "flex";
  $("editCategoryName").focus();
}

$("closeEditCategoryModal").addEventListener(
  "click",
  () => ($("modalEditCategory").style.display = "none"),
);
$("cancelEditCategory").addEventListener(
  "click",
  () => ($("modalEditCategory").style.display = "none"),
);

$("editCategoryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("editCategoryId").value;
  const tenCu = $("danhSachDanhMuc").querySelector(`button[data-id="${id}"]`)
    .dataset.name;
  const tenMoi = $("editCategoryName").value.trim();

  if (!tenMoi || tenMoi === tenCu) {
    $("modalEditCategory").style.display = "none";
    return;
  }

  try {
    await goiAPI("/categories/" + id, {
      method: "PUT",
      body: { name: tenMoi },
    });
    $("modalEditCategory").style.display = "none";
    hienToast("Đã cập nhật!", "success");
    await taiVaHienDanhMuc();
  } catch (l) {
    hienToast(l.message, "error");
  }
});

// --- MODAL XÓA DANH MỤC ---
function xoaDanhMucUI(id) {
  const taskCount = danhSachCongViec.filter(
    (cv) => String(cv.category_id) === String(id),
  ).length;
  let msg = "Bạn có chắc chắn muốn xóa danh mục này?";
  if (taskCount > 0) {
    msg = `Danh mục này đang gắn với <b>${taskCount}</b> công việc.<br/>Xóa danh mục sẽ KHÔNG xóa các công việc đó, nhưng chúng sẽ mất phân loại này.<br/><b>Bạn vẫn muốn xóa?</b>`;
  }
  $("deleteCategoryMsg").innerHTML = msg;
  $("deleteCategoryId").value = id;
  $("modalDeleteCategory").style.display = "flex";
}

$("closeDeleteCategoryModal").addEventListener(
  "click",
  () => ($("modalDeleteCategory").style.display = "none"),
);
$("cancelDeleteCategory").addEventListener(
  "click",
  () => ($("modalDeleteCategory").style.display = "none"),
);

$("confirmDeleteCategory").addEventListener("click", async () => {
  const id = $("deleteCategoryId").value;
  try {
    await goiAPI("/categories/" + id, { method: "DELETE" });
    $("modalDeleteCategory").style.display = "none";
    hienToast("Đã xóa danh mục!", "success");
    await taiVaHienDanhMuc();
    await taiCongViec(); // Cập nhật lại danh sách công việc để giao diện loại bỏ category_id
  } catch (l) {
    hienToast(l.message, "error");
  }
});
