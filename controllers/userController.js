const userService = require("../services/userService");

/**
 * Lấy danh sách tất cả người dùng (Admin)
 */
async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || "Không lấy được danh sách người dùng." });
  }
}

/**
 * Lấy thông tin người dùng theo ID
 */
async function getUserById(req, res) {
  try {
    const user = await userService.getUserById(parseInt(req.params.id));
    res.json(user);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Đăng ký tài khoản
 */
async function register(req, res) {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({
      message: "Đăng ký thành công.",
      user,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Đăng nhập
 */
async function login(req, res) {
  try {
    const user = await userService.loginUser(req.body);
    res.json({
      message: "Đăng nhập thành công.",
      user,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Cập nhật thông tin cá nhân
 */
async function updateUser(req, res) {
  try {
    const user = await userService.updateUser(parseInt(req.params.id), req.body);
    res.json({
      message: "Cập nhật thành công.",
      user,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Đổi mật khẩu
 */
async function changePassword(req, res) {
  try {
    const result = await userService.changePassword(parseInt(req.params.id), req.body);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Khóa/mở khóa tài khoản (Admin)
 */
async function setLockStatus(req, res) {
  try {
    const { is_locked } = req.body;
    const user = await userService.setLockStatus(parseInt(req.params.id), is_locked);
    res.json({
      message: is_locked ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.",
      user,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

/**
 * Xóa người dùng
 */
async function deleteUser(req, res) {
  try {
    const user = await userService.deleteUser(parseInt(req.params.id));
    res.json({
      message: "Đã xóa người dùng.",
      user,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  register,
  login,
  updateUser,
  changePassword,
  setLockStatus,
  deleteUser,
};
