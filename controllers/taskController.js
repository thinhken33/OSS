const taskService = require("../services/taskService");

/**
 * Lấy tất cả tasks của user
 */
async function getTasks(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const tasks = await taskService.getTasksByUserId(userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message || "Không lấy được danh sách công việc." });
  }
}

/**
 * Lấy task theo ID
 */
async function getTaskById(req, res) {
  try {
    const task = await taskService.getTaskById(parseInt(req.params.id));
    res.json(task);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Tạo task mới
 */
async function createTask(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const task = await taskService.createTask(userId, req.body);
    res.status(201).json({
      message: "Tạo công việc thành công.",
      task,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Cập nhật task
 */
async function updateTask(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const task = await taskService.updateTask(parseInt(req.params.id), userId, req.body);
    res.json({
      message: "Cập nhật công việc thành công.",
      task,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Cập nhật trạng thái task
 */
async function updateTaskStatus(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const { status } = req.body;
    const task = await taskService.updateTaskStatus(parseInt(req.params.id), userId, status);
    res.json({
      message: "Cập nhật trạng thái thành công.",
      task,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Xóa task
 */
async function deleteTask(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const task = await taskService.deleteTask(parseInt(req.params.id), userId);
    res.json({
      message: "Đã xóa công việc.",
      task,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Tìm kiếm và lọc tasks
 */
async function searchTasks(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const filters = {
      keyword: req.query.keyword || null,
      status: req.query.status || null,
      priority: req.query.priority || null,
      category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
      due_date: req.query.due_date || null,
    };
    const tasks = await taskService.searchTasks(userId, filters);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message || "Không tìm kiếm được." });
  }
}

/**
 * Lấy thống kê tasks
 */
async function getTaskStats(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const stats = await taskService.getTaskStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message || "Không lấy được thống kê." });
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  searchTasks,
  getTaskStats,
};