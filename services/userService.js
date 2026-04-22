const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Lấy danh sách tất cả người dùng
 */
async function getAllUsers() {
  return await userModel.getAllUsers();
}

/**
 * Lấy thông tin người dùng theo ID
 */
async function getUserById(id) {
  const user = await userModel.getUserById(id);
  if (!user) {
    throw createError("Không tìm thấy người dùng.", 404);
  }
  return user;
}

/**
 * Đăng ký tài khoản mới
 */
async function registerUser({ full_name, email, password, avatar_url, bio }) {
  // Validate dữ liệu đầu vào
  const errors = [];

  if (!full_name || !full_name.trim()) {
    errors.push("Họ và tên không được để trống.");
  }

  if (!email || !email.trim()) {
    errors.push("Email không được để trống.");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Email không đúng định dạng.");
    }
  }

  if (!password || password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự.");
  }

  if (errors.length) {
    throw createError(errors.join(" "), 400);
  }

  // Kiểm tra email đã tồn tại
  const existingUser = await userModel.getUserByEmail(email.trim());
  if (existingUser) {
    throw createError("Email đã được sử dụng.", 409);
  }

  // Hash mật khẩu
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // Tạo user mới
  const newUser = await userModel.createUser({
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    password_hash,
    avatar_url: avatar_url || null,
    bio: bio || null,
  });

  return newUser;
}

/**
 * Đăng nhập
 */
async function loginUser({ email, password }) {
  if (!email || !password) {
    throw createError("Email và mật khẩu không được để trống.", 400);
  }

  const user = await userModel.getUserByEmail(email.trim().toLowerCase());

  if (!user) {
    throw createError("Email hoặc mật khẩu không đúng.", 401);
  }

  if (user.is_locked) {
    throw createError("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw createError("Email hoặc mật khẩu không đúng.", 401);
  }

  // Trả về user không có password_hash
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Cập nhật thông tin cá nhân
 */
async function updateUser(id, { full_name, avatar_url, bio }) {
  if (!full_name || !full_name.trim()) {
    throw createError("Họ và tên không được để trống.", 400);
  }

  const user = await userModel.updateUser(id, {
    full_name: full_name.trim(),
    avatar_url,
    bio,
  });

  if (!user) {
    throw createError("Không tìm thấy người dùng để cập nhật.", 404);
  }

  return user;
}

/**
 * Đổi mật khẩu
 */
async function changePassword(id, { current_password, new_password }) {
  if (!current_password || !new_password) {
    throw createError("Mật khẩu hiện tại và mật khẩu mới không được để trống.", 400);
  }

  if (new_password.length < 6) {
    throw createError("Mật khẩu mới phải có ít nhất 6 ký tự.", 400);
  }

  // Lấy user có password_hash
  const user = await userModel.getUserById(id);
  if (!user) {
    throw createError("Không tìm thấy người dùng.", 404);
  }

  // Lấy full user (có password_hash) qua email
  const fullUser = await userModel.getUserByEmail(user.email);
  const isMatch = await bcrypt.compare(current_password, fullUser.password_hash);
  if (!isMatch) {
    throw createError("Mật khẩu hiện tại không đúng.", 401);
  }

  const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
  await userModel.updatePassword(id, password_hash);

  return { message: "Đổi mật khẩu thành công." };
}

/**
 * Khóa/mở khóa tài khoản (Admin)
 */
async function setLockStatus(id, is_locked) {
  const user = await userModel.setLockStatus(id, is_locked);
  if (!user) {
    throw createError("Không tìm thấy người dùng.", 404);
  }
  return user;
}

/**
 * Xóa người dùng
 */
async function deleteUser(id) {
  const user = await userModel.getUserById(id);
  if (!user) {
    throw createError("Không tìm thấy người dùng để xóa.", 404);
  }

  await userModel.deleteUser(id);
  return user;
}

module.exports = {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  changePassword,
  setLockStatus,
  deleteUser,
};
