# 🚀 TaskFlow Express - Web App Quản Lý Công Việc Cá Nhân

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-5.x-blue)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15%2B-blue)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**TaskFlow** là một giải pháp quản lý công việc cá nhân toàn diện, được xây dựng trên nền tảng Node.js và PostgreSQL. Dự án tập trung vào hiệu suất, tính đơn giản và trải nghiệm người dùng mượt mà với giao diện Vanilla JavaScript hiện đại.

---

## 📂 Cấu trúc dự án

```text
OSS/
├── public/                 # Tài nguyên tĩnh (Frontend)
│   ├── css/                # Stylesheets (Vanilla CSS)
│   ├── js/                 # Logic xử lý phía client (Modular JS)
│   │   ├── auth.js         # Xử lý đăng nhập/đăng ký
│   │   ├── tasks.js        # Quản lý công việc (CRUD, Filter)
│   │   ├── kanban.js       # Logic kéo thả và hiển thị bảng
│   │   └── ...             # Các module chức năng khác
│   ├── uploads/            # Thư mục lưu trữ file tải lên (Avatar)
│   ├── index.html          # Entry point duy nhất của Frontend (SPA style)
│   └── ...                 # Các trang lỗi (404, 403, 500)
├── src/                    # Mã nguồn phía Backend
│   ├── config/             # Cấu hình hệ thống (DB, Env)
│   ├── controllers/        # Xử lý logic yêu cầu (Request Handlers)
│   ├── database/           # Script khởi tạo SQL
│   ├── middlewares/        # Các hàm trung gian (Auth, Validation)
│   ├── models/             # Định nghĩa cấu trúc dữ liệu và truy vấn
│   ├── routes/             # Định tuyến API
│   ├── services/           # Nghiệp vụ cốt lõi (Business Logic)
│   └── server.js           # Điểm khởi đầu của ứng dụng Backend
├── .env                    # Biến môi trường (không commit)
├── .env.example            # File mẫu cấu hình môi trường
├── package.json            # Quản lý dependencies và scripts
└── README.md               # Tài liệu hướng dẫn dự án
```

---

## 🛠️ Công nghệ sử dụng

### Backend (Node.js & Express)

- **Framework**: Express.js (v5.x)
- **Database**: PostgreSQL với thư viện `pg`
- **Authentication**: JSON Web Token (JWT) & bcryptjs
- **File Upload**: Multer (xử lý avatar)
- **Environment**: dotenv

### Frontend (Modern Vanilla JS)

- **Core**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Vanilla CSS với kiến trúc biến (CSS Variables)
- **UI Components**: Tùy chỉnh (Datepicker, Kanban Board, Modal)
- **Communication**: Fetch API (Async/Await)

---

## ✨ Chức năng chính

### 🔐 Bảo mật & Xác thực

- Đăng ký/Đăng nhập với mật khẩu được mã hóa (bcrypt).
- Xác thực phiên làm việc qua JWT (Stored in LocalStorage).
- Phân quyền người dùng (User) và quản trị viên (Admin).

### 📝 Quản lý công việc (Task Management)

- **CRUD**: Tạo, xem, sửa, xóa công việc.
- **Kanban Board**: Quản lý trạng thái công việc trực quan.
- **Phân loại**: Theo mức độ ưu tiên (Low, Medium, High) và danh mục tùy chỉnh.
- **Thời hạn**: Đặt ngày bắt đầu và ngày kết thúc (Due date).

### 🔔 Thông báo & Nhắc việc

- Hệ thống tự động kiểm tra công việc sắp đến hạn mỗi 30 giây.
- Tự động đánh dấu công việc "Quá hạn" (Overdue).
- Thông báo thời gian thực ngay trên giao diện người dùng.

### 📊 Thống kê & Cá nhân hóa

- Dashboard thống kê hiệu suất (Hoàn thành, Đang làm, Quá hạn).
- Quản lý hồ sơ cá nhân: Cập nhật thông tin, đổi ảnh đại diện, tiểu sử.
- Quản lý danh mục (Categories) linh hoạt.

---

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống

- **Node.js**: Phiên bản 18.0.0 trở lên.
- **PostgreSQL**: Phiên bản 15 trở lên.

### 2. Các bước thực hiện

**Bước 1: Clone dự án và cài đặt thư viện**

```bash
npm install
```

**Bước 2: Thiết lập cơ sở dữ liệu**

1. Tạo một database mới trong PostgreSQL (ví dụ: `task_manager`).
2. Chạy nội dung file `src/database/init.sql` để khởi tạo cấu trúc bảng.

**Bước 3: Cấu hình biến môi trường**
Sao chép `.env.example` thành `.env` và cập nhật thông tin:

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=task_manager
DB_PORT=5432
JWT_SECRET=your_secret_key
```

**Bước 4: Khởi chạy ứng dụng**

- Chế độ phát triển (Phát hiện thay đổi file):
  ```bash
  npm run dev
  ```
- Chế độ Production:
  ```bash
  npm start
  ```

Truy cập: `http://localhost:3000`

---

## 🔒 Bảo mật dữ liệu

- Mọi API được bảo vệ bởi middleware xác thực, đảm bảo người dùng chỉ truy cập được dữ liệu của chính mình.
- Dữ liệu đầu vào được kiểm tra ở cả 2 phía (Frontend & Backend) để ngăn chặn XSS và SQL Injection.

## 📄 Giấy phép

Dự án được phát hành dưới giấy phép **MIT**. Xem chi tiết tại [LICENSE](LICENSE).
