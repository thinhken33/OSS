// QUICK ADD
if ($("quickTaskInput")) {
  $("quickTaskInput").addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const title = e.target.value.trim();
      if (!title) return;
      try {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const y = d.getFullYear(),
          mo = d.getMonth() + 1,
          day = d.getDate();
        const h = d.getHours(),
          m = d.getMinutes();

        const start_date = `${y}-${pad(mo)}-${pad(day)}T${pad(h)}:${pad(m)}`;
        const due_date = `${y}-${pad(mo)}-${pad(day)}T23:59`;

        await goiAPI("/tasks", {
          method: "POST",
          body: {
            title,
            description: "",
            priority: "medium",
            status: "pending",
            start_date: start_date,
            due_date: due_date,
            category_id: null,
          },
        });
        e.target.value = "";
        hienToast("Đã thêm công việc nhanh!", "success");
        await taiCongViec();
      } catch (l) {
        hienToast(l.message, "error");
      }
    }
  });
}

// DRAG AND DROP KANBAN
let draggedTaskId = null;
document.addEventListener("dragstart", (e) => {
  if (e.target.classList && e.target.classList.contains("task-card")) {
    draggedTaskId = e.target.dataset.id;
    setTimeout(() => e.target.classList.add("dragging"), 0);
  }
});
document.addEventListener("dragend", (e) => {
  if (e.target.classList && e.target.classList.contains("task-card")) {
    e.target.classList.remove("dragging");
    draggedTaskId = null;
  }
});
document.querySelectorAll(".kanban-list").forEach((col) => {
  col.addEventListener("dragover", (e) => {
    e.preventDefault();
    col.classList.add("drag-over");
  });
  col.addEventListener("dragleave", (e) => {
    col.classList.remove("drag-over");
  });
  col.addEventListener("drop", async (e) => {
    e.preventDefault();
    col.classList.remove("drag-over");
    if (!draggedTaskId) return;
    const targetStatus = col.closest(".kanban-col").dataset.status;

    // Optimistic update locally
    const cv = danhSachCongViec.find(
      (x) => String(x.task_id) === String(draggedTaskId),
    );
    if (cv && cv.status !== targetStatus) {
      cv.status = targetStatus;
      hienThiCongViec(); // render immediately

      // Thêm hiệu ứng highlight để người dùng dễ nhận ra vị trí mới của thẻ
      const newCardElement = document.querySelector(
        `.kanban-col[data-status="${targetStatus}"] .task-card[data-id="${draggedTaskId}"]`,
      );
      if (newCardElement) {
        newCardElement.classList.add("card-just-dropped");
        setTimeout(
          () => newCardElement.classList.remove("card-just-dropped"),
          1500,
        );
      }

      try {
        await goiAPI(`/tasks/${draggedTaskId}/status`, {
          method: "PATCH",
          body: { status: targetStatus },
        });
      } catch (l) {
        hienToast(l.message, "error");
        await taiCongViec(); // revert if failed
      }
    }
  });
});
