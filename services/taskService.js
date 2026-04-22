const taskModel = require("../models/taskModel");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Validate dữ liệu task
 */
function validateTask(taskData) {
  const errors = [];

  if (!taskData.title || typeof taskData.title !== "string" || !taskData.title.trim()) {
    errors.push("Tên công việc không được để trống.");
  }

  const allowedStatus = ["pending", "in_progress", "completed", "overdue"];
  if (taskData.status && !allowedStatus.includes(taskData.status)) {
    errors.push("Trạng thái không hợp lệ.");
  }

  const allowedPriority = ["low", "medium", "high"];
  if (taskData.priority && !allowedPriority.includes(taskData.priority)) {
    errors.push("Mức ưu tiên không hợp lệ.");
  }

  // Kiểm tra hạn hoàn thành >= ngày bắt đầu
  if (taskData.start_date && taskData.due_date) {
    if (new Date(taskData.due_date) < new Date(taskData.start_date)) {
      errors.push("Hạn hoàn thành không được nhỏ hơn ngày bắt đầu.");
    }
  }

  return errors;
}

/**
 * Lấy tất cả tasks của user
 */
async function getTasksByUserId(userId) {
  return await taskModel.getTasksByUserId(userId);
}

/**
 * Lấy task theo ID
 */
async function getTaskById(id) {
  const task = await taskModel.getTaskById(id);
  if (!task) {
    throw createError("Không tìm thấy công việc.", 404);
  }
  return task;
}

/**
 * Tạo task mới
 */
async function createTask(userId, taskData) {
  const errors = validateTask(taskData);
  if (errors.length) {
    throw createError(errors.join(" "), 400);
  }

  return await taskModel.createTask({
    user_id: userId,
    category_id: taskData.category_id || null,
    title: taskData.title.trim(),
    description: (taskData.description || "").trim(),
    start_date: taskData.start_date || null,
    due_date: taskData.due_date || null,
    priority: taskData.priority || "medium",
    status: taskData.status || "pending",
  });
}

/**
 * Cập nhật task
 */
async function updateTask(id, userId, taskData) {
  const errors = validateTask(taskData);
  if (errors.length) {
    throw createError(errors.join(" "), 400);
  }

  const oldTask = await taskModel.getTaskById(id);
  if (!oldTask) {
    throw createError("Không tìm thấy công việc để sửa.", 404);
  }

  // Kiểm tra quyền sở hữu
  if (oldTask.user_id !== userId) {
    throw createError("Bạn không có quyền sửa công việc này.", 403);
  }

  // Nếu chuyển sang completed, lưu thời điểm hoàn thành
  let completed_at = oldTask.completed_at;
  if (taskData.status === "completed" && oldTask.status !== "completed") {
    completed_at = new Date().toISOString();
  } else if (taskData.status !== "completed") {
    completed_at = null;
  }

  return await taskModel.updateTask(id, {
    category_id: taskData.category_id || null,
    title: taskData.title.trim(),
    description: (taskData.description || "").trim(),
    start_date: taskData.start_date || null,
    due_date: taskData.due_date || null,
    priority: taskData.priority || "medium",
    status: taskData.status || "pending",
    completed_at,
  });
}

/**
 * Cập nhật trạng thái task
 */
async function updateTaskStatus(id, userId, status) {
  const allowedStatus = ["pending", "in_progress", "completed", "overdue"];
  if (!allowedStatus.includes(status)) {
    throw createError("Trạng thái không hợp lệ.", 400);
  }

  const task = await taskModel.getTaskById(id);
  if (!task) {
    throw createError("Không tìm thấy công việc.", 404);
  }

  if (task.user_id !== userId) {
    throw createError("Bạn không có quyền cập nhật công việc này.", 403);
  }

  const completed_at = status === "completed" ? new Date().toISOString() : null;
  return await taskModel.updateTaskStatus(id, status, completed_at);
}

/**
 * Xóa task
 */
async function deleteTask(id, userId) {
  const task = await taskModel.getTaskById(id);
  if (!task) {
    throw createError("Không tìm thấy công việc để xóa.", 404);
  }

  if (task.user_id !== userId) {
    throw createError("Bạn không có quyền xóa công việc này.", 403);
  }

  await taskModel.deleteTask(id);
  return task;
}

/**
 * Tìm kiếm và lọc tasks
 */
async function searchTasks(userId, filters) {
  return await taskModel.searchTasks(userId, filters);
}

/**
 * Lấy thống kê tasks
 */
async function getTaskStats(userId) {
  return await taskModel.getTaskStats(userId);
}

/**
 * Đánh dấu tự động các task quá hạn
 */
async function markOverdueTasks() {
  return await taskModel.markOverdueTasks();
}

module.exports = {
  getTasksByUserId,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  searchTasks,
  getTaskStats,
  markOverdueTasks,
};