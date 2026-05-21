const express = require('express');
const router = express.Router();

// ==========================================
// ĐỊNH TUYẾN CHÍNH (MAIN ROUTER)
// Phân luồng các API theo từng nhóm chức năng
// ==========================================

// Quản lý người dùng: Đăng ký, đăng nhập, thông tin cá nhân, quản trị admin
router.use('/users', require('./nguoiDungRoutes'));

// Quản lý danh mục: Thêm, sửa, xóa danh mục công việc của người dùng
router.use('/categories', require('./danhMucRoutes'));

// Quản lý công việc: CRUD công việc, lọc, phân loại trạng thái (Kanban)
router.use('/tasks', require('./congViecRoutes'));

// Quản lý thông báo: Nhắc việc sắp đến hạn, đánh dấu đã đọc
router.use('/notifications', require('./thongBaoRoutes'));

module.exports = router;
