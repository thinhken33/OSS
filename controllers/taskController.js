const taskService = require("../services/taskService");

async function getAllTasks(req, res) {
  try {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message || "Không lấy được danh sách công việc." });
  }
}

async function getTaskById(req, res) {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.json(task);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Không lấy được công việc." });
  }
}

async function createTask(req, res) {
  try {
    const newTask = await taskService.createTask(req.body);
    res.status(201).json(newTask);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Không thêm được công việc." });
  }
}

async function updateTask(req, res) {
  try {
    const updatedTask = await taskService.updateTask(req.params.id, req.body);
    res.json(updatedTask);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Không sửa được công việc." });
  }
}

async function deleteTask(req, res) {
  try {
    const deletedTask = await taskService.deleteTask(req.params.id);
    res.json({
      message: "Đã xoá công việc.",
      task: deletedTask
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Không xoá được công việc." });
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};