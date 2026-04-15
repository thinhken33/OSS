const API_URL = "/api/tasks";

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const resetFilterBtn = document.getElementById("resetFilterBtn");
const toggleFilterBtn = document.getElementById("toggleFilterBtn");
const filterPanel = document.getElementById("filterPanel");

const tabs = document.querySelectorAll(".tab");

const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const openAddModalBtn = document.getElementById("openAddModal");
const closeModalBtn = document.getElementById("closeModal");
const cancelModalBtn = document.getElementById("cancelModal");
const taskForm = document.getElementById("taskForm");

const taskIdInput = document.getElementById("taskId");
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskStatusInput = document.getElementById("taskStatus");
const taskPriorityInput = document.getElementById("taskPriority");
const taskDueDateInput = document.getElementById("taskDueDate");

let currentTab = "all";
let tasks = [];

function getTodayString() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const local = new Date(today.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

function isOverdue(task) {
  if (task.status === "completed") return false;
  return task.dueDate < getTodayString();
}

function getDisplayStatus(task) {
  if (task.status === "completed") return "completed";
  if (isOverdue(task)) return "overdue";
  return task.status;
}

function getStatusLabel(status) {
  return {
    "not-started": "Chưa bắt đầu",
    "in-progress": "Đang làm",
    "completed": "Hoàn thành",
    "overdue": "Quá hạn"
  }[status];
}

function getPriorityLabel(priority) {
  return {
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao"
  }[priority];
}

function getStatusClass(status) {
  return {
    "not-started": "gray",
    "in-progress": "blue",
    "completed": "green",
    "overdue": "red"
  }[status];
}

function getPriorityClass(priority) {
  return {
    low: "gray",
    medium: "orange",
    high: "red"
  }[priority];
}

function getTaskIcon(status) {
  return {
    "not-started": { symbol: "◯", color: "#777" },
    "in-progress": { symbol: "▷", color: "#3b82f6" },
    "completed": { symbol: "✔", color: "#10b981" },
    "overdue": { symbol: "⚠", color: "#ef4444" }
  }[status];
}

function formatDate(dateString) {
  if (!dateString) return "Không có hạn";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateLabel(task) {
  if (!task.dueDate) return "Không có hạn";
  if (task.dueDate === getTodayString()) return "Hôm nay";
  return formatDate(task.dueDate);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

async function fetchTasks() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Không tải được dữ liệu.");
  tasks = await res.json();
}

function updateSummaryCounts() {
  const counts = {
    all: tasks.length,
    "not-started": 0,
    "in-progress": 0,
    "completed": 0,
    "overdue": 0
  };

  tasks.forEach((task) => {
    const status = getDisplayStatus(task);
    counts[status] += 1;
  });

  document.getElementById("stat-total").textContent = `${counts.all} tổng`;
  document.getElementById("stat-not-started").textContent = `${counts["not-started"]} chưa bắt đầu`;
  document.getElementById("stat-in-progress").textContent = `${counts["in-progress"]} đang làm`;
  document.getElementById("stat-completed").textContent = `${counts["completed"]} xong`;
  document.getElementById("stat-overdue").textContent = `${counts["overdue"]} quá hạn`;

  tabs.forEach((tab) => {
    const key = tab.dataset.tab;
    tab.querySelector("span").textContent = counts[key];
  });
}

function getFilteredTasks() {
  const keyword = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedPriority = priorityFilter.value;

  return tasks.filter((task) => {
    const displayStatus = getDisplayStatus(task);

    const matchTab = currentTab === "all" || displayStatus === currentTab;
    const matchSearch =
      task.title.toLowerCase().includes(keyword) ||
      (task.description || "").toLowerCase().includes(keyword);

    const matchStatus = selectedStatus === "all" || displayStatus === selectedStatus;
    const matchPriority = selectedPriority === "all" || task.priority === selectedPriority;

    return matchTab && matchSearch && matchStatus && matchPriority;
  });
}

function renderTasks() {
  const filteredTasks = getFilteredTasks().sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  if (filteredTasks.length === 0) {
    taskList.innerHTML = "";
    emptyState.classList.add("show");
    updateSummaryCounts();
    return;
  }

  emptyState.classList.remove("show");

  taskList.innerHTML = filteredTasks.map((task) => {
    const displayStatus = getDisplayStatus(task);
    const statusClass = getStatusClass(displayStatus);
    const priorityClass = getPriorityClass(task.priority);
    const icon = getTaskIcon(displayStatus);
    const dateClass = displayStatus === "overdue" ? "date red-text" : "date";

    return `
      <article class="task-card ${displayStatus === "overdue" ? "overdue" : ""}">
        <div class="task-row">
          <div class="task-left">
            <div class="task-icon" style="color:${icon.color}">${icon.symbol}</div>
            <div class="task-content">
              <div class="task-title">${escapeHtml(task.title)}</div>
              <div class="task-meta">
                <span class="pill ${statusClass}">${getStatusLabel(displayStatus)}</span>
                <span class="pill ${priorityClass}">${getPriorityLabel(task.priority)}</span>
                <span class="${dateClass}">🗓 ${formatDateLabel(task)}</span>
              </div>
            </div>
          </div>

          <div class="task-actions">
            <div class="action-icons">
              <button class="action-btn edit-btn" type="button" data-id="${task.id}">✎</button>
              <button class="action-btn delete-btn" type="button" data-id="${task.id}">🗑</button>
            </div>
            <button class="detail-link toggle-detail-btn" type="button">⌄ Chi tiết</button>
          </div>
        </div>

        <div class="task-detail">${escapeHtml(task.description || "Không có mô tả.")}</div>
      </article>
    `;
  }).join("");

  updateSummaryCounts();
}

function openModal(mode, task = null) {
  modalTitle.textContent = mode === "add" ? "Thêm công việc" : "Sửa công việc";

  if (mode === "add") {
    taskForm.reset();
    taskIdInput.value = "";
    taskStatusInput.value = "not-started";
    taskPriorityInput.value = "medium";
    taskDueDateInput.value = getTodayString();
  } else if (task) {
    taskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskDescriptionInput.value = task.description || "";
    taskStatusInput.value = task.status;
    taskPriorityInput.value = task.priority;
    taskDueDateInput.value = task.dueDate;
  }

  modalBackdrop.classList.add("show");
}

function closeModal() {
  modalBackdrop.classList.remove("show");
  taskForm.reset();
  taskIdInput.value = "";
}

async function createTask(taskData) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Không thêm được công việc.");
  return data;
}

async function updateTask(id, taskData) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Không sửa được công việc.");
  return data;
}

async function removeTask(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Không xoá được công việc.");
  return data;
}

async function refreshUI() {
  await fetchTasks();
  renderTasks();
}

openAddModalBtn.addEventListener("click", () => openModal("add"));
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = taskIdInput.value;
  const taskData = {
    title: taskTitleInput.value.trim(),
    description: taskDescriptionInput.value.trim(),
    status: taskStatusInput.value,
    priority: taskPriorityInput.value,
    dueDate: taskDueDateInput.value
  };

  try {
    if (id) {
      await updateTask(id, taskData);
    } else {
      await createTask(taskData);
    }

    closeModal();
    await refreshUI();
  } catch (error) {
    alert(error.message);
  }
});

searchInput.addEventListener("input", renderTasks);
statusFilter.addEventListener("change", renderTasks);
priorityFilter.addEventListener("change", renderTasks);

toggleFilterBtn.addEventListener("click", () => {
  filterPanel.classList.toggle("show");
});

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  statusFilter.value = "all";
  priorityFilter.value = "all";
  currentTab = "all";

  tabs.forEach((tab) => tab.classList.remove("active"));
  document.querySelector('[data-tab="all"]').classList.add("active");

  renderTasks();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.tab;
    renderTasks();
  });
});

taskList.addEventListener("click", async (e) => {
  const editBtn = e.target.closest(".edit-btn");
  const deleteBtn = e.target.closest(".delete-btn");
  const detailBtn = e.target.closest(".toggle-detail-btn");

  if (editBtn) {
    const id = editBtn.dataset.id;
    const task = tasks.find((item) => item.id === id);
    if (task) openModal("edit", task);
    return;
  }

  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const confirmed = confirm(`Bạn có chắc muốn xoá công việc "${task.title}" không?`);
    if (!confirmed) return;

    try {
      await removeTask(id);
      await refreshUI();
    } catch (error) {
      alert(error.message);
    }
    return;
  }

  if (detailBtn) {
    const card = detailBtn.closest(".task-card");
    const detail = card.querySelector(".task-detail");
    const isOpen = detail.classList.contains("show");

    detail.classList.toggle("show");
    detailBtn.textContent = isOpen ? "⌄ Chi tiết" : "⌃ Chi tiết";
  }
});

refreshUI().catch((error) => {
  alert(error.message);
});