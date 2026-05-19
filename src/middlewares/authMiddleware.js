const jwt = require("jsonwebtoken");
const nguoiDungModel = require("../models/nguoiDungModel");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123456";

/**
 * Middleware để kiểm tra và xác thực JWT token
 */
async function xacThucToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          message: "Không có quyền truy cập, vui lòng kèm Token hợp lệ.",
        });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Lưu thông tin giải mã vào req.user
    req.user = decoded;

    // (Tùy chọn) Kiểm tra xem user có bị khoá hay không từ DB
    const user = await nguoiDungModel.layNguoiDungTheoId(req.user.user_id);
    if (!user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại." });
    }
    if (user.is_locked) {
      return res.status(403).json({ message: "Tài khoản đã bị khoá." });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn." });
    }
    return res.status(401).json({ message: "Token không hợp lệ." });
  }
}

/**
 * Middleware kiểm tra quyền truy cập (IDOR protection)
 * Đảm bảo chỉ chính người dùng đó mới có thể thao tác tài nguyên của họ (param 'userId' hoặc 'id')
 */
function baoVeTaiNguyen(req, res, next) {
  // Lấy ID từ userId (nếu endpoint có /user/:userId) hoặc id (nếu endpoint là /users/:id)
  const targetId = req.params.userId
    ? parseInt(req.params.userId)
    : parseInt(req.params.id);

  if (req.user.role !== "admin" && targetId !== req.user.user_id) {
    return res
      .status(403)
      .json({
        message: "Bạn không có quyền thao tác trên tài nguyên của người khác.",
      });
  }
  next();
}

/**
 * Middleware kiểm tra quyền admin
 */
function xacThucAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Tính năng này chỉ dành cho Quản trị viên." });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  xacThucToken,
  baoVeTaiNguyen,
  xacThucAdmin,
};
