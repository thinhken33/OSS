const multer = require("multer");
const path = require("path");

/**
 * Cấu hình lưu trữ Multer cho avatar người dùng
 * Lưu file vào thư mục: public/uploads/avatars/
 * Tên file: avatar_{userId}_{timestamp}.{ext}
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public", "uploads", "avatars"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "avatar_" + req.params.id + "_" + Date.now() + ext);
  },
});

/**
 * Middleware upload avatar với các ràng buộc:
 * - Giới hạn dung lượng: 2MB
 * - Chỉ chấp nhận file ảnh: jpg, jpeg, png, gif, webp
 */
const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)."));
  },
});

module.exports = { uploadAvatar };
