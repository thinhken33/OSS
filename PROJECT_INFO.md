# Tài liệu Thông tin Dự án - Task Manager

## Mục lục
1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Công nghệ sử dụng](#2-công-nghệ-sử-dụng)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Cơ sở dữ liệu](#4-cơ-sở-dữ-liệu)
5. [Kiến trúc & Logic hệ thống](#5-kiến-trúc--logic-hệ-thống)
6. [Danh sách API (Routes)](#6-danh-sách-api-routes)
7. [Hàm theo từng tầng (Layer)](#7-hàm-theo-từng-tầng-layer)
   - [Config](#config)
   - [Models](#models)
   - [Services](#services)
   - [Controllers](#controllers)
8. [Luồng xử lý nghiệp vụ](#8-luồng-xử-lý-nghiệp-vụ)
9. [Xử lý lỗi](#9-xử-lý-lỗi)

---

## 1. Tổng quan dự án

**Task Manager** là ứng dụng quản lý công việc cá nhân theo kiến trúc **MVC (Model - View - Controller)** sử dụng **Node.js + Express** và **PostgreSQL**. Hệ thống cung cấp RESTful API cho phép người dùng:

- Đăng ký, đăng nhập tài khoản
- Tạo, phân loại, theo dõi và quản lý công việc
- Nhận thông báo nhắc nhở tự động khi công việc sắp đến hạn hoặc đã quá hạn
- Quản trị viên có thể khóa/mở tài khoản, xem toàn bộ người dùng

---

## 2. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Runtime | Node.js |
| Framework | Express v5 |
| Cơ sở dữ liệu | PostgreSQL |
| Kết nối DB | pg (node-postgres) |
| Mã hóa mật khẩu | bcryptjs |
| Biến môi trường | dotenv |
| Tự động cập nhật (dev) | node --watch |

---

## 3. Cấu trúc thư mục

```
OSS/
├── server.js               # Điểm khởi động ứng dụng
├── .env.example            # Mẫu biến môi trường
├── package.json
├── config/
│   └── db.js               # Kết nối và khởi tạo PostgreSQL
├── database/
│   └── init.sql            # Script tạo bảng CSDL
├── models/                 # Tầng truy vấn CSDL trực tiếp
│   ├── nguoiDungModel.js
│   ├── congViecModel.js
│   ├── danhMucModel.js
│   └── thongBaoModel.js
├── services/               # Tầng xử lý nghiệp vụ (business logic)
│   ├── nguoiDungService.js
│   ├── congViecService.js
│   ├── danhMucService.js
│   └── thongBaoService.js
├── controllers/            # Tầng nhận & phản hồi HTTP request
│   ├── nguoiDungController.js
│   ├── congViecController.js
│   ├── danhMucController.js
│   └── thongBaoController.js
├── routes/                 # Định nghĩa các API endpoint
│   ├── nguoiDungRoutes.js
│   ├── congViecRoutes.js
│   ├── danhMucRoutes.js
│   └── thongBaoRoutes.js
└── public/                 # Các file tĩnh (HTML, CSS, JS frontend)
```

---

## 4. Cơ sở dữ liệu

### Sơ đồ quan hệ (ERD)

```
Users ──< Categories
  │
  └──< Tasks >── Categories
         │
         └──< Notifications
```

### Bảng `Users` (Người dùng)

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `user_id` | SERIAL | PRIMARY KEY | ID tự tăng |
| `full_name` | VARCHAR(100) | NOT NULL | Họ và tên |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email đăng nhập |
| `password_hash` | VARCHAR(255) | NOT NULL | Mật khẩu đã băm (bcrypt) |
| `avatar_url` | VARCHAR(255) | | URL ảnh đại diện |
| `bio` | TEXT | | Tiểu sử |
| `role` | VARCHAR(20) | DEFAULT 'user' | Vai trò (user / admin) |
| `is_locked` | BOOLEAN | DEFAULT FALSE | Trạng thái khoá tài khoản |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Thời điểm tạo |

### Bảng `Categories` (Danh mục công việc)

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `category_id` | SERIAL | PRIMARY KEY | ID tự tăng |
| `user_id` | INT | FK → Users(user_id) ON DELETE CASCADE | Chủ sở hữu danh mục |
| `name` | VARCHAR(100) | NOT NULL | Tên danh mục |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Thời điểm tạo |

### Bảng `Tasks` (Công việc)

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `task_id` | SERIAL | PRIMARY KEY | ID tự tăng |
| `user_id` | INT | FK → Users ON DELETE CASCADE | Chủ sở hữu công việc |
| `category_id` | INT | FK → Categories ON DELETE SET NULL | Danh mục (có thể null) |
| `title` | VARCHAR(255) | NOT NULL | Tiêu đề công việc |
| `description` | TEXT | | Mô tả chi tiết |
| `start_date` | TIMESTAMP | | Ngày bắt đầu |
| `due_date` | TIMESTAMP | | Hạn hoàn thành |
| `priority` | VARCHAR(20) | CHECK: low/medium/high | Mức độ ưu tiên |
| `status` | VARCHAR(20) | DEFAULT 'pending', CHECK: pending/in_progress/completed/overdue | Trạng thái |
| `completed_at` | TIMESTAMP | | Thời điểm hoàn thành thực tế |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Thời điểm tạo |

### Bảng `Notifications` (Thông báo)

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `notification_id` | SERIAL | PRIMARY KEY | ID tự tăng |
| `user_id` | INT | FK → Users ON DELETE CASCADE | Người nhận thông báo |
| `task_id` | INT | FK → Tasks ON DELETE CASCADE | Công việc liên quan (có thể null) |
| `message` | TEXT | NOT NULL | Nội dung thông báo |
| `is_read` | BOOLEAN | DEFAULT FALSE | Trạng thái đã đọc |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Thời điểm tạo |

### Index tối ưu truy vấn

| Index | Bảng | Cột |
|---|---|---|
| `idx_tasks_user_id` | Tasks | user_id |
| `idx_tasks_status` | Tasks | status |
| `idx_tasks_priority` | Tasks | priority |
| `idx_tasks_due_date` | Tasks | due_date |
| `idx_categories_user_id` | Categories | user_id |
| `idx_notifications_user_id` | Notifications | user_id |
| `idx_notifications_is_read` | Notifications | is_read |

---

## 5. Kiến trúc & Logic hệ thống

### Luồng xử lý request

```
HTTP Request
    │
    ▼
Routes (định tuyến)
    │
    ▼
Controller (nhận request, trả response)
    │
    ▼
Service (xử lý nghiệp vụ, kiểm tra ràng buộc, phân quyền)
    │
    ▼
Model (truy vấn SQL vào PostgreSQL)
    │
    ▼
Database (PostgreSQL)
```

### Tính năng tự động (Cron Job)

Server chạy một **setInterval mỗi 60 giây** để tự động cập nhật trạng thái các công việc `pending` hoặc `in_progress` có `due_date < NOW()` thành `overdue`.

```
setInterval → congViecService.danhDauCongViecQuaHan() → congViecModel.danhDauCongViecQuaHan()
           → UPDATE Tasks SET status = 'overdue' WHERE status IN ('pending','in_progress') AND due_date < NOW()
```

### Phân quyền (Authorization)

Hệ thống kiểm tra quyền sở hữu tài nguyên ở tầng **Service** trước khi cho phép sửa/xoá:
- **Công việc**: chỉ chủ sở hữu (`user_id` khớp) mới được sửa/xoá/cập nhật trạng thái.
- **Danh mục**: chỉ chủ sở hữu mới được sửa/xoá.
- **Thông báo**: chỉ người nhận mới được đánh dấu đã đọc / xoá.
- **Khoá tài khoản**: chỉ Admin thực hiện (chưa có middleware kiểm tra, hiện gọi trực tiếp).

### Bảo mật mật khẩu

- Mật khẩu được băm bằng `bcryptjs` với **10 vòng salt** trước khi lưu vào DB.
- Khi đăng nhập, dùng `bcrypt.compare()` để so sánh — **không bao giờ** lưu hoặc so sánh mật khẩu dạng plain text.
- Trường `password_hash` không được trả về trong bất kỳ response nào (trừ truy vấn nội bộ để xác thực).

### CORS

Server cho phép mọi nguồn (`*`) với các phương thức: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.

---

## 6. Danh sách API (Routes)

### Người dùng (`/api/users`)

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/users/register` | Đăng ký tài khoản mới |
| `POST` | `/api/users/login` | Đăng nhập |
| `GET` | `/api/users/` | Lấy danh sách tất cả người dùng (Admin) |
| `GET` | `/api/users/:id` | Lấy thông tin người dùng theo ID |
| `PUT` | `/api/users/:id` | Cập nhật thông tin cá nhân |
| `PUT` | `/api/users/:id/password` | Đổi mật khẩu |
| `PATCH` | `/api/users/:id/lock` | Khoá / mở khoá tài khoản (Admin) |
| `DELETE` | `/api/users/:id` | Xoá tài khoản |

### Danh mục (`/api/categories`)

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/categories/user/:userId` | Lấy danh sách danh mục của người dùng |
| `GET` | `/api/categories/:id` | Lấy chi tiết một danh mục |
| `POST` | `/api/categories/user/:userId` | Tạo danh mục mới |
| `PUT` | `/api/categories/:id/user/:userId` | Cập nhật danh mục |
| `DELETE` | `/api/categories/:id/user/:userId` | Xoá danh mục |

### Công việc (`/api/tasks`)

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/tasks/user/:userId` | Lấy toàn bộ công việc của người dùng |
| `GET` | `/api/tasks/user/:userId/search` | Tìm kiếm / lọc công việc (query params) |
| `GET` | `/api/tasks/user/:userId/stats` | Thống kê công việc theo trạng thái |
| `GET` | `/api/tasks/:id` | Lấy chi tiết công việc |
| `POST` | `/api/tasks/user/:userId` | Tạo công việc mới |
| `PUT` | `/api/tasks/:id/user/:userId` | Cập nhật toàn bộ thông tin công việc |
| `PATCH` | `/api/tasks/:id/user/:userId/status` | Chỉ cập nhật trạng thái công việc |
| `DELETE` | `/api/tasks/:id/user/:userId` | Xoá công việc |

**Query params cho tìm kiếm** (`/search`):

| Param | Mô tả |
|---|---|
| `keyword` | Từ khoá tìm trong tiêu đề và mô tả |
| `status` | Lọc theo trạng thái (`pending`, `in_progress`, `completed`, `overdue`) |
| `priority` | Lọc theo mức ưu tiên (`low`, `medium`, `high`) |
| `category_id` | Lọc theo danh mục |
| `due_date` | Lọc theo ngày hạn (định dạng `YYYY-MM-DD`) |

### Thông báo (`/api/notifications`)

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/notifications/user/:userId` | Lấy tất cả thông báo |
| `GET` | `/api/notifications/user/:userId/unread` | Lấy thông báo chưa đọc |
| `GET` | `/api/notifications/user/:userId/unread/count` | Đếm số thông báo chưa đọc |
| `POST` | `/api/notifications/user/:userId` | Tạo thông báo mới thủ công |
| `POST` | `/api/notifications/user/:userId/reminders` | Tạo thông báo nhắc việc tự động |
| `PATCH` | `/api/notifications/user/:userId/read-all` | Đánh dấu tất cả là đã đọc |
| `PATCH` | `/api/notifications/:id/user/:userId/read` | Đánh dấu một thông báo là đã đọc |
| `DELETE` | `/api/notifications/:id/user/:userId` | Xoá thông báo |

### Health Check

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/health` | Kiểm tra trạng thái server |

---

## 7. Hàm theo từng tầng (Layer)

### Config

#### `config/db.js`

| Hàm | Mô tả |
|---|---|
| `khoiTaoDatabase()` | Đọc `database/init.sql` và chạy để tạo bảng nếu chưa tồn tại |
| `truyVan(cauLenh, thamSo)` | Wrapper thực thi truy vấn SQL, ghi log thời gian thực thi (dev mode) |

---

### Models

#### `models/nguoiDungModel.js` — Truy vấn bảng `Users`

| Hàm | Tham số | Trả về | Mô tả |
|---|---|---|---|
| `layTatCaNguoiDung()` | — | `Array` | SELECT tất cả user (không có `password_hash`) |
| `layNguoiDungTheoId(maNguoiDung)` | `number` | `Object\|null` | SELECT user theo ID (không có `password_hash`) |
| `layNguoiDungTheoEmail(email)` | `string` | `Object\|null` | SELECT đầy đủ user theo email (có `password_hash`) |
| `taoNguoiDung({full_name, email, password_hash, avatar_url, bio})` | `Object` | `Object` | INSERT user mới, trả về user (không có `password_hash`) |
| `capNhatNguoiDung(maNguoiDung, {full_name, avatar_url, bio})` | `number, Object` | `Object\|null` | UPDATE thông tin cá nhân |
| `capNhatMatKhau(maNguoiDung, matKhauHash)` | `number, string` | `Object\|null` | UPDATE `password_hash` |
| `datTrangThaiKhoa(maNguoiDung, daKhoa)` | `number, boolean` | `Object\|null` | UPDATE `is_locked` |
| `xoaNguoiDung(maNguoiDung)` | `number` | `boolean` | DELETE user, trả về `true` nếu thành công |

#### `models/congViecModel.js` — Truy vấn bảng `Tasks`

| Hàm | Tham số | Trả về | Mô tả |
|---|---|---|---|
| `layCongViecTheoNguoiDung(maNguoiDung)` | `number` | `Array` | SELECT tất cả task của user, JOIN với Categories để lấy `category_name` |
| `layCongViecTheoId(maCongViec)` | `number` | `Object\|null` | SELECT chi tiết task, JOIN Categories |
| `taoCongViec({user_id, category_id, title, ...})` | `Object` | `Object` | INSERT task mới |
| `capNhatCongViec(maCongViec, {...})` | `number, Object` | `Object\|null` | UPDATE toàn bộ thông tin task |
| `capNhatTrangThaiCongViec(maCongViec, trangThai, thoiDiemHoanThanh)` | `number, string, string\|null` | `Object\|null` | UPDATE chỉ `status` và `completed_at` |
| `xoaCongViec(maCongViec)` | `number` | `boolean` | DELETE task |
| `timKiemCongViec(maNguoiDung, {tuKhoa, trangThai, mucUuTien, maDanhMuc, hanHoanThanh})` | `number, Object` | `Array` | SELECT có điều kiện động (WHERE + AND) |
| `layCongViecQuaHanVaSapDenHan(maNguoiDung)` | `number` | `Array` | SELECT task chưa hoàn thành có `due_date <= NOW() + 1 day` |
| `danhDauCongViecQuaHan()` | — | `Array` | UPDATE hàng loạt task sang `overdue` nếu `due_date < NOW()` |
| `layThongKeCongViec(maNguoiDung)` | `number` | `Object` | SELECT COUNT GROUP BY status (tổng, chờ, đang làm, hoàn thành, quá hạn) |

#### `models/danhMucModel.js` — Truy vấn bảng `Categories`

| Hàm | Tham số | Trả về | Mô tả |
|---|---|---|---|
| `layDanhMucTheoNguoiDung(maNguoiDung)` | `number` | `Array` | SELECT tất cả danh mục của user |
| `layDanhMucTheoId(maDanhMuc)` | `number` | `Object\|null` | SELECT danh mục theo ID |
| `layDanhMucTheoTen(maNguoiDung, tenDanhMuc)` | `number, string` | `Object\|null` | SELECT để kiểm tra trùng tên (case-insensitive) |
| `taoDanhMuc({user_id, name})` | `Object` | `Object` | INSERT danh mục mới |
| `capNhatDanhMuc(maDanhMuc, {name})` | `number, Object` | `Object\|null` | UPDATE tên danh mục |
| `xoaDanhMuc(maDanhMuc)` | `number` | `boolean` | DELETE danh mục |

#### `models/thongBaoModel.js` — Truy vấn bảng `Notifications`

| Hàm | Tham số | Trả về | Mô tả |
|---|---|---|---|
| `layThongBaoTheoNguoiDung(maNguoiDung)` | `number` | `Array` | SELECT tất cả thông báo của user, JOIN Tasks lấy `task_title` |
| `layThongBaoChuaDoc(maNguoiDung)` | `number` | `Array` | SELECT thông báo chưa đọc (`is_read = FALSE`) |
| `demThongBaoChuaDoc(maNguoiDung)` | `number` | `number` | SELECT COUNT thông báo chưa đọc |
| `layThongBaoTheoId(maThongBao)` | `number` | `Object\|null` | SELECT một thông báo theo ID |
| `taoThongBao({user_id, task_id, message})` | `Object` | `Object` | INSERT thông báo mới |
| `danhDauDaDoc(maThongBao)` | `number` | `Object\|null` | UPDATE `is_read = TRUE` cho một thông báo |
| `danhDauTatCaDaDoc(maNguoiDung)` | `number` | `Array` | UPDATE `is_read = TRUE` cho tất cả thông báo chưa đọc của user |
| `xoaThongBao(maThongBao)` | `number` | `boolean` | DELETE thông báo |

---

### Services

#### `services/nguoiDungService.js` — Nghiệp vụ người dùng

| Hàm | Mô tả | Lỗi có thể ném |
|---|---|---|
| `layTatCaNguoiDung()` | Gọi model lấy danh sách user | — |
| `layNguoiDungTheoId(maNguoiDung)` | Lấy user, ném 404 nếu không tồn tại | 404 |
| `dangKyNguoiDung({full_name, email, password, ...})` | Validate đầu vào, kiểm tra email trùng, băm mật khẩu, tạo user | 400 (dữ liệu sai), 409 (email trùng) |
| `dangNhap({email, password})` | Tìm user theo email, kiểm tra tài khoản bị khoá, so khớp mật khẩu bcrypt, trả về user (không có `password_hash`) | 400, 401 (sai thông tin), 403 (bị khoá) |
| `capNhatNguoiDung(maNguoiDung, {full_name, avatar_url, bio})` | Validate tên, cập nhật thông tin cá nhân | 400, 404 |
| `doiMatKhau(maNguoiDung, {current_password, new_password})` | Xác minh mật khẩu cũ, băm mật khẩu mới, cập nhật | 400, 401, 404 |
| `datTrangThaiKhoa(maNguoiDung, daKhoa)` | Khoá/mở khoá tài khoản | 404 |
| `xoaNguoiDung(maNguoiDung)` | Kiểm tra tồn tại, xoá user | 404 |

#### `services/congViecService.js` — Nghiệp vụ công việc

| Hàm | Mô tả | Lỗi có thể ném |
|---|---|---|
| `layCongViecTheoNguoiDung(maNguoiDung)` | Lấy danh sách công việc của user | — |
| `layCongViecTheoId(maCongViec)` | Lấy chi tiết task, ném 404 nếu không tồn tại | 404 |
| `taoCongViec(maNguoiDung, duLieuCongViec)` | Validate (tiêu đề, status, priority, ngày tháng), tạo task | 400 |
| `capNhatCongViec(maCongViec, maNguoiDung, duLieuCongViec)` | Validate, kiểm tra tồn tại & quyền sở hữu, tự động lưu `completed_at`, cập nhật | 400, 403, 404 |
| `capNhatTrangThaiCongViec(maCongViec, maNguoiDung, trangThai)` | Validate trạng thái, kiểm tra quyền, cập nhật `status` + `completed_at` | 400, 403, 404 |
| `xoaCongViec(maCongViec, maNguoiDung)` | Kiểm tra tồn tại & quyền, xoá task | 403, 404 |
| `timKiemCongViec(maNguoiDung, boLoc)` | Tìm kiếm/lọc task theo từ khoá, trạng thái, ưu tiên, danh mục, hạn chót | — |
| `layThongKeCongViec(maNguoiDung)` | Trả về thống kê số lượng task theo trạng thái | — |
| `danhDauCongViecQuaHan()` | Batch update tất cả task đã quá hạn → `overdue` (gọi bởi cron) | — |

#### `services/danhMucService.js` — Nghiệp vụ danh mục

| Hàm | Mô tả | Lỗi có thể ném |
|---|---|---|
| `layDanhMucTheoNguoiDung(maNguoiDung)` | Lấy danh sách danh mục của user | — |
| `layDanhMucTheoId(maDanhMuc)` | Lấy danh mục, ném 404 nếu không tồn tại | 404 |
| `taoDanhMuc(maNguoiDung, {name})` | Validate tên, kiểm tra trùng tên, tạo danh mục | 400, 409 |
| `capNhatDanhMuc(maDanhMuc, maNguoiDung, {name})` | Validate, kiểm tra tồn tại & quyền, kiểm tra trùng tên mới, cập nhật | 400, 403, 404, 409 |
| `xoaDanhMuc(maDanhMuc, maNguoiDung)` | Kiểm tra tồn tại & quyền, xoá danh mục | 403, 404 |

#### `services/thongBaoService.js` — Nghiệp vụ thông báo

| Hàm | Mô tả | Lỗi có thể ném |
|---|---|---|
| `layThongBaoTheoNguoiDung(maNguoiDung)` | Lấy tất cả thông báo của user | — |
| `layThongBaoChuaDoc(maNguoiDung)` | Lấy thông báo chưa đọc | — |
| `demThongBaoChuaDoc(maNguoiDung)` | Đếm thông báo chưa đọc | — |
| `taoThongBao({user_id, task_id, message})` | Validate nội dung, tạo thông báo | 400 |
| `danhDauDaDoc(maThongBao, maNguoiDung)` | Kiểm tra tồn tại & quyền, đánh dấu 1 thông báo đã đọc | 403, 404 |
| `danhDauTatCaDaDoc(maNguoiDung)` | Đánh dấu tất cả thông báo của user là đã đọc | — |
| `xoaThongBao(maThongBao, maNguoiDung)` | Kiểm tra tồn tại & quyền, xoá thông báo | 403, 404 |
| `taoThongBaoNhacViec(maNguoiDung)` | Lấy danh sách task quá hạn/sắp hạn, tạo thông báo nhắc nhở tương ứng | — |

---

### Controllers

Mỗi controller nhận `req`/`res`, gọi Service tương ứng và trả về JSON response.

#### `controllers/nguoiDungController.js`

| Hàm Controller | HTTP Mapping | Service được gọi |
|---|---|---|
| `layTatCaNguoiDung(req, res)` | `GET /api/users/` | `nguoiDungService.layTatCaNguoiDung()` |
| `layNguoiDungTheoId(req, res)` | `GET /api/users/:id` | `nguoiDungService.layNguoiDungTheoId(id)` |
| `dangKy(req, res)` | `POST /api/users/register` | `nguoiDungService.dangKyNguoiDung(body)` → 201 |
| `dangNhap(req, res)` | `POST /api/users/login` | `nguoiDungService.dangNhap(body)` |
| `capNhatNguoiDung(req, res)` | `PUT /api/users/:id` | `nguoiDungService.capNhatNguoiDung(id, body)` |
| `doiMatKhau(req, res)` | `PUT /api/users/:id/password` | `nguoiDungService.doiMatKhau(id, body)` |
| `datTrangThaiKhoa(req, res)` | `PATCH /api/users/:id/lock` | `nguoiDungService.datTrangThaiKhoa(id, is_locked)` |
| `xoaNguoiDung(req, res)` | `DELETE /api/users/:id` | `nguoiDungService.xoaNguoiDung(id)` |

#### `controllers/congViecController.js`

| Hàm Controller | HTTP Mapping | Service được gọi |
|---|---|---|
| `layCongViec(req, res)` | `GET /api/tasks/user/:userId` | `congViecService.layCongViecTheoNguoiDung(userId)` |
| `layCongViecTheoId(req, res)` | `GET /api/tasks/:id` | `congViecService.layCongViecTheoId(id)` |
| `taoCongViec(req, res)` | `POST /api/tasks/user/:userId` | `congViecService.taoCongViec(userId, body)` → 201 |
| `capNhatCongViec(req, res)` | `PUT /api/tasks/:id/user/:userId` | `congViecService.capNhatCongViec(id, userId, body)` |
| `capNhatTrangThaiCongViec(req, res)` | `PATCH /api/tasks/:id/user/:userId/status` | `congViecService.capNhatTrangThaiCongViec(id, userId, status)` |
| `xoaCongViec(req, res)` | `DELETE /api/tasks/:id/user/:userId` | `congViecService.xoaCongViec(id, userId)` |
| `timKiemCongViec(req, res)` | `GET /api/tasks/user/:userId/search` | `congViecService.timKiemCongViec(userId, boLoc)` |
| `layThongKeCongViec(req, res)` | `GET /api/tasks/user/:userId/stats` | `congViecService.layThongKeCongViec(userId)` |

#### `controllers/danhMucController.js`

| Hàm Controller | HTTP Mapping | Service được gọi |
|---|---|---|
| `layDanhMuc(req, res)` | `GET /api/categories/user/:userId` | `danhMucService.layDanhMucTheoNguoiDung(userId)` |
| `layDanhMucTheoId(req, res)` | `GET /api/categories/:id` | `danhMucService.layDanhMucTheoId(id)` |
| `taoDanhMuc(req, res)` | `POST /api/categories/user/:userId` | `danhMucService.taoDanhMuc(userId, body)` → 201 |
| `capNhatDanhMuc(req, res)` | `PUT /api/categories/:id/user/:userId` | `danhMucService.capNhatDanhMuc(id, userId, body)` |
| `xoaDanhMuc(req, res)` | `DELETE /api/categories/:id/user/:userId` | `danhMucService.xoaDanhMuc(id, userId)` |

#### `controllers/thongBaoController.js`

| Hàm Controller | HTTP Mapping | Service được gọi |
|---|---|---|
| `layThongBao(req, res)` | `GET /api/notifications/user/:userId` | `thongBaoService.layThongBaoTheoNguoiDung(userId)` |
| `layThongBaoChuaDoc(req, res)` | `GET /api/notifications/user/:userId/unread` | `thongBaoService.layThongBaoChuaDoc(userId)` |
| `demChuaDoc(req, res)` | `GET /api/notifications/user/:userId/unread/count` | `thongBaoService.demThongBaoChuaDoc(userId)` |
| `taoThongBao(req, res)` | `POST /api/notifications/user/:userId` | `thongBaoService.taoThongBao({user_id, task_id, message})` → 201 |
| `danhDauDaDoc(req, res)` | `PATCH /api/notifications/:id/user/:userId/read` | `thongBaoService.danhDauDaDoc(id, userId)` |
| `danhDauTatCaDaDoc(req, res)` | `PATCH /api/notifications/user/:userId/read-all` | `thongBaoService.danhDauTatCaDaDoc(userId)` |
| `xoaThongBao(req, res)` | `DELETE /api/notifications/:id/user/:userId` | `thongBaoService.xoaThongBao(id, userId)` |
| `taoNhacViec(req, res)` | `POST /api/notifications/user/:userId/reminders` | `thongBaoService.taoThongBaoNhacViec(userId)` |

---

## 8. Luồng xử lý nghiệp vụ

### Đăng ký tài khoản

```
POST /api/users/register
  → dangKy() controller
  → dangKyNguoiDung() service:
      1. Validate: full_name, email (regex), password (≥6 ký tự)
      2. Kiểm tra email đã tồn tại trong DB
      3. bcrypt.hash(password, 10)
      4. taoNguoiDung() model → INSERT vào DB
  → Trả về 201 + thông tin user (không có password_hash)
```

### Đăng nhập

```
POST /api/users/login
  → dangNhap() controller
  → dangNhap() service:
      1. Validate: email, password không rỗng
      2. layNguoiDungTheoEmail() → tìm user
      3. Kiểm tra is_locked
      4. bcrypt.compare(password, password_hash)
      5. Loại bỏ password_hash khỏi đối tượng trả về
  → Trả về 200 + thông tin user
```

### Tạo công việc

```
POST /api/tasks/user/:userId
  → taoCongViec() controller
  → taoCongViec() service:
      1. kiemTraDuLieuCongViec(): title không rỗng, status/priority hợp lệ, due_date >= start_date
      2. taoCongViec() model → INSERT vào DB
  → Trả về 201 + thông tin công việc
```

### Cập nhật trạng thái công việc

```
PATCH /api/tasks/:id/user/:userId/status
  → capNhatTrangThaiCongViec() controller
  → capNhatTrangThaiCongViec() service:
      1. Validate trạng thái mới hợp lệ
      2. Lấy task, kiểm tra tồn tại
      3. Kiểm tra quyền sở hữu (user_id === maNguoiDung)
      4. Nếu status = 'completed' → lưu completed_at = NOW()
      5. capNhatTrangThaiCongViec() model → UPDATE
  → Trả về 200 + thông tin task cập nhật
```

### Tạo thông báo nhắc việc tự động

```
POST /api/notifications/user/:userId/reminders
  → taoNhacViec() controller
  → taoThongBaoNhacViec() service:
      1. layCongViecQuaHanVaSapDenHan() model → lấy task due_date <= NOW() + 1 ngày
      2. Với mỗi task:
         - Nếu due_date < NOW() → nội dung "đã quá hạn!"
         - Nếu due_date >= NOW() và task đã bắt đầu → nội dung "sắp đến hạn"
         - Nếu task chưa bắt đầu → bỏ qua
         - taoThongBao() model → INSERT vào DB
  → Trả về danh sách thông báo đã tạo
```

---

## 9. Xử lý lỗi

### Cấu trúc lỗi

Tất cả các lỗi nghiệp vụ được tạo bằng hàm tiện ích `taoLoi(thongBao, maLoi)` trong mỗi Service:

```js
function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}
```

### Bảng mã lỗi HTTP

| Mã | Tình huống |
|---|---|
| `400` | Dữ liệu đầu vào không hợp lệ (thiếu trường, sai định dạng, vi phạm ràng buộc) |
| `401` | Sai email/mật khẩu khi đăng nhập hoặc xác minh mật khẩu cũ |
| `403` | Tài khoản bị khoá hoặc cố thao tác trên tài nguyên không thuộc sở hữu |
| `404` | Không tìm thấy tài nguyên (user, task, category, notification) |
| `409` | Trùng lặp dữ liệu (email đã dùng, tên danh mục đã tồn tại) |
| `500` | Lỗi hệ thống không xác định |

### Middleware xử lý lỗi tập trung (server.js)

```js
app.use((err, req, res, next) => {
  console.error("❌ Lỗi Server:", err.message);
  res.status(err.statusCode || 500).json({
    message: err.message || "Lỗi hệ thống.",
  });
});
```

---

*Tài liệu được tạo tự động từ mã nguồn dự án Task Manager.*
