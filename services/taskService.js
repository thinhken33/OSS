const taskModel = require("../models/taskModel");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateTask(taskData) {
  const errors = [];

  if (!taskData.title || typeof taskData.title !== "string" || !taskData.title.trim()) {
    errors.push("Tên công việc không hợp lệ.");
  }

  if (!taskData.dueDate || typeof taskData.dueDate !== "string") {
    errors.push("Hạn công việc không hợp lệ.");
  }

  const allowedStatus = ["not-started", "in-progress", "completed"];
  if (!allowedStatus.includes(taskData.status)) {
    errors.push("Trạng thái không hợp lệ.");
  }

  const allowedPriority = ["low", "medium", "high"];
  if (!allowedPriority.includes(taskData.priority)) {
    errors.push("Mức ưu tiên không hợp lệ.");
  }

  return errors;
}

async function getAllTasks() {
  return await taskModel.getAllTasks();
}

async function getTaskById(id) {
  const task = await taskModel.getTaskById(id);

  if (!task) {
    throw createError("Không tìm thấy công việc.", 404);
  }

  return task;
}

async function createTask(taskData) {
  const errors = validateTask(taskData);

  if (errors.length) {
    throw createError(errors.join(" "), 400);
  }

  const newTask = {
    id: Date.now().toString(),
    title: taskData.title.trim(),
    description: (taskData.description || "").trim(),
    status: taskData.status,
    priority: taskData.priority,
    dueDate: taskData.dueDate,
    createdAt: new Date().toISOString()
  };

  await taskModel.addTask(newTask);
  return newTask;
}

async function updateTask(id, taskData) {
  const errors = validateTask(taskData);

  if (errors.length) {
    throw createError(errors.join(" "), 400);
  }

  const oldTask = await taskModel.getTaskById(id);

  if (!oldTask) {
    throw createError("Không tìm thấy công việc để sửa.", 404);
  }

  const updatedTask = {
    ...oldTask,
    title: taskData.title.trim(),
    description: (taskData.description || "").trim(),
    status: taskData.status,
    priority: taskData.priority,
    dueDate: taskData.dueDate,
    updatedAt: new Date().toISOString()
  };

  await taskModel.updateTask(id, updatedTask);
  return updatedTask;
}

async function deleteTask(id) {
  const task = await taskModel.getTaskById(id);

  if (!task) {
    throw createError("Không tìm thấy công việc để xoá.", 404);
  }

  await taskModel.deleteTask(id);
  return task;
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};