const db = require("../config/db");

/**
 * Lấy tất cả tasks của một người dùng (có kèm tên danh mục)
 */
async function getTasksByUserId(userId) {
  const result = await db.query(
    `SELECT t.*, c.name AS category_name
     FROM Tasks t
     LEFT JOIN Categories c ON t.category_id = c.category_id
     WHERE t.user_id = $1
     ORDER BY t.created_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Lấy task theo ID
 */
async function getTaskById(id) {
  const result = await db.query(
    `SELECT t.*, c.name AS category_name
     FROM Tasks t
     LEFT JOIN Categories c ON t.category_id = c.category_id
     WHERE t.task_id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Tạo task mới
 */
async function createTask({ user_id, category_id, title, description, start_date, due_date, priority, status }) {
  const result = await db.query(
    `INSERT INTO Tasks (user_id, category_id, title, description, start_date, due_date, priority, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [user_id, category_id || null, title, description || null, start_date || null, due_date || null, priority || 'medium', status || 'pending']
  );
  return result.rows[0];
}

/**
 * Cập nhật task
 */
async function updateTask(id, { category_id, title, description, start_date, due_date, priority, status, completed_at }) {
  const result = await db.query(
    `UPDATE Tasks
     SET category_id = $1,
         title = $2,
         description = $3,
         start_date = $4,
         due_date = $5,
         priority = $6,
         status = $7,
         completed_at = $8
     WHERE task_id = $9
     RETURNING *`,
    [category_id || null, title, description || null, start_date || null, due_date || null, priority, status, completed_at || null, id]
  );
  return result.rows[0] || null;
}

/**
 * Cập nhật trạng thái task
 */
async function updateTaskStatus(id, status, completed_at) {
  const result = await db.query(
    `UPDATE Tasks SET status = $1, completed_at = $2 WHERE task_id = $3 RETURNING *`,
    [status, completed_at || null, id]
  );
  return result.rows[0] || null;
}

/**
 * Xóa task
 */
async function deleteTask(id) {
  const result = await db.query(
    `DELETE FROM Tasks WHERE task_id = $1 RETURNING task_id`,
    [id]
  );
  return result.rowCount > 0;
}

/**
 * Tìm kiếm và lọc tasks
 */
async function searchTasks(userId, { keyword, status, priority, category_id, due_date }) {
  let query = `
    SELECT t.*, c.name AS category_name
    FROM Tasks t
    LEFT JOIN Categories c ON t.category_id = c.category_id
    WHERE t.user_id = $1
  `;
  const params = [userId];
  let paramIndex = 2;

  if (keyword) {
    query += ` AND (LOWER(t.title) LIKE LOWER($${paramIndex}) OR LOWER(t.description) LIKE LOWER($${paramIndex}))`;
    params.push(`%${keyword}%`);
    paramIndex++;
  }

  if (status) {
    query += ` AND t.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (priority) {
    query += ` AND t.priority = $${paramIndex}`;
    params.push(priority);
    paramIndex++;
  }

  if (category_id) {
    query += ` AND t.category_id = $${paramIndex}`;
    params.push(category_id);
    paramIndex++;
  }

  if (due_date) {
    query += ` AND DATE(t.due_date) = $${paramIndex}`;
    params.push(due_date);
    paramIndex++;
  }

  query += ` ORDER BY t.due_date ASC NULLS LAST`;

  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Lấy tasks sắp đến hạn hoặc quá hạn (dùng cho thông báo)
 */
async function getOverdueAndUpcomingTasks(userId) {
  const result = await db.query(
    `SELECT * FROM Tasks
     WHERE user_id = $1
       AND status NOT IN ('completed')
       AND due_date IS NOT NULL
       AND due_date <= NOW() + INTERVAL '1 day'
     ORDER BY due_date ASC`,
    [userId]
  );
  return result.rows;
}

/**
 * Đánh dấu tự động các task quá hạn
 */
async function markOverdueTasks() {
  const result = await db.query(
    `UPDATE Tasks
     SET status = 'overdue'
     WHERE status IN ('pending', 'in_progress')
       AND due_date < NOW()
     RETURNING *`
  );
  return result.rows;
}

/**
 * Lấy thống kê tasks của user
 */
async function getTaskStats(userId) {
  const result = await db.query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'pending') AS pending,
       COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
       COUNT(*) FILTER (WHERE status = 'completed') AS completed,
       COUNT(*) FILTER (WHERE status = 'overdue') AS overdue
     FROM Tasks
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
}

module.exports = {
  getTasksByUserId,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  searchTasks,
  getOverdueAndUpcomingTasks,
  markOverdueTasks,
  getTaskStats,
};