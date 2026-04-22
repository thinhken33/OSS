# 📡 Tài liệu API Backend — Task Manager

> **Dành cho team Frontend** — Tài liệu mô tả đầy đủ các API endpoints, request/response format, và lưu ý khi tích hợp.

---

## 🔧 Thông tin chung

- **Base URL:** `http://localhost:3000/api`
- **Content-Type:** `application/json`
- **Phương thức hỗ trợ:** GET, POST, PUT, PATCH, DELETE

### Health Check

```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "message": "Server đang hoạt động.",
  "timestamp": "2026-04-22T08:30:00.000Z"
}
```

---

## 1. 👤 Users (`/api/users`)

### 1.1 Đăng ký

```
POST /api/users/register
```

**Body:**
```json
{
  "full_name": "Nguyễn Văn A",
  "email": "a@example.com",
  "password": "matkhau123",
  "avatar_url": "https://...",   // (tuỳ chọn)
  "bio": "Mô tả bản thân"       // (tuỳ chọn)
}
```

**Response (201):**
```json
{
  "message": "Đăng ký thành công.",
  "user": {
    "user_id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "a@example.com",
    "avatar_url": null,
    "bio": null,
    "role": "user",
    "is_locked": false,
    "created_at": "2026-04-22T08:30:00.000Z"
  }
}
```

**Lỗi có thể xảy ra:**
| Status | Nguyên nhân |
|--------|-------------|
| 400 | Thiếu thông tin / email sai định dạng / mật khẩu < 6 ký tự |
| 409 | Email đã được sử dụng |

---

### 1.2 Đăng nhập

```
POST /api/users/login
```

**Body:**
```json
{
  "email": "a@example.com",
  "password": "matkhau123"
}
```

**Response (200):**
```json
{
  "message": "Đăng nhập thành công.",
  "user": {
    "user_id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "a@example.com",
    "role": "user",
    "is_locked": false,
    "created_at": "2026-04-22T08:30:00.000Z"
  }
}
```

**Lỗi:**
| Status | Nguyên nhân |
|--------|-------------|
| 400 | Thiếu email hoặc mật khẩu |
| 401 | Sai email hoặc mật khẩu |
| 403 | Tài khoản đã bị khóa |

---

### 1.3 Xem thông tin user

```
GET /api/users/:id
```

### 1.4 Cập nhật thông tin

```
PUT /api/users/:id
```

**Body:**
```json
{
  "full_name": "Tên mới",
  "avatar_url": "https://...",
  "bio": "Mô tả mới"
}
```

### 1.5 Đổi mật khẩu

```
PUT /api/users/:id/password
```

**Body:**
```json
{
  "current_password": "matkhau_cu",
  "new_password": "matkhau_moi_123"
}
```

### 1.6 Khóa/Mở khóa tài khoản (Admin)

```
PATCH /api/users/:id/lock
```

**Body:**
```json
{
  "is_locked": true
}
```

### 1.7 Danh sách users (Admin)

```
GET /api/users
```

### 1.8 Xóa user

```
DELETE /api/users/:id
```

---

## 2. 🗂️ Categories (`/api/categories`)

### 2.1 Danh sách danh mục của user

```
GET /api/categories/user/:userId
```

**Response (200):**
```json
[
  {
    "category_id": 1,
    "user_id": 1,
    "name": "Học tập",
    "created_at": "2026-04-22T08:30:00.000Z"
  }
]
```

### 2.2 Xem danh mục theo ID

```
GET /api/categories/:id
```

### 2.3 Tạo danh mục

```
POST /api/categories/user/:userId
```

**Body:**
```json
{
  "name": "Công việc"
}
```

**Lỗi:**
| Status | Nguyên nhân |
|--------|-------------|
| 400 | Tên trống |
| 409 | Tên danh mục đã tồn tại |

### 2.4 Sửa danh mục

```
PUT /api/categories/:id/user/:userId
```

**Body:**
```json
{
  "name": "Tên mới"
}
```

### 2.5 Xóa danh mục

```
DELETE /api/categories/:id/user/:userId
```

> **Lưu ý:** Khi xóa danh mục, các task thuộc danh mục đó sẽ có `category_id = NULL` (không bị xóa theo).

---

## 3. 📝 Tasks (`/api/tasks`)

### 3.1 Danh sách tasks của user

```
GET /api/tasks/user/:userId
```

**Response (200):**
```json
[
  {
    "task_id": 1,
    "user_id": 1,
    "category_id": 2,
    "category_name": "Học tập",
    "title": "Làm bài tập",
    "description": "Bài tập chương 5",
    "start_date": "2026-04-20T00:00:00.000Z",
    "due_date": "2026-04-25T00:00:00.000Z",
    "priority": "high",
    "status": "in_progress",
    "completed_at": null,
    "created_at": "2026-04-20T08:00:00.000Z"
  }
]
```

### 3.2 Xem task theo ID

```
GET /api/tasks/:id
```

### 3.3 Tạo task

```
POST /api/tasks/user/:userId
```

**Body:**
```json
{
  "title": "Làm bài tập",
  "description": "Bài tập chương 5",
  "category_id": 2,
  "start_date": "2026-04-20",
  "due_date": "2026-04-25",
  "priority": "high",
  "status": "pending"
}
```

**Các trường bắt buộc:** `title`

**Giá trị mặc định:**
| Trường | Mặc định |
|--------|----------|
| `priority` | `"medium"` |
| `status` | `"pending"` |

### 3.4 Sửa task

```
PUT /api/tasks/:id/user/:userId
```

**Body:** (giống tạo task)

### 3.5 Cập nhật trạng thái

```
PATCH /api/tasks/:id/user/:userId/status
```

**Body:**
```json
{
  "status": "completed"
}
```

> **Lưu ý:** Khi chuyển sang `completed`, hệ thống tự động lưu `completed_at`. Khi chuyển ra khỏi `completed`, `completed_at` được xóa.

### 3.6 Xóa task

```
DELETE /api/tasks/:id/user/:userId
```

### 3.7 Tìm kiếm & Lọc

```
GET /api/tasks/user/:userId/search?keyword=...&status=...&priority=...&category_id=...&due_date=...
```

**Query params (tất cả tuỳ chọn):**
| Param | Ví dụ | Mô tả |
|-------|-------|-------|
| `keyword` | `bài tập` | Tìm trong title + description |
| `status` | `pending` | Lọc theo trạng thái |
| `priority` | `high` | Lọc theo ưu tiên |
| `category_id` | `2` | Lọc theo danh mục |
| `due_date` | `2026-04-25` | Lọc theo ngày hết hạn |

### 3.8 Thống kê

```
GET /api/tasks/user/:userId/stats
```

**Response (200):**
```json
{
  "total": "10",
  "pending": "3",
  "in_progress": "2",
  "completed": "4",
  "overdue": "1"
}
```

---

## 4. 🔔 Notifications (`/api/notifications`)

### 4.1 Danh sách thông báo

```
GET /api/notifications/user/:userId
```

### 4.2 Thông báo chưa đọc

```
GET /api/notifications/user/:userId/unread
```

### 4.3 Đếm chưa đọc

```
GET /api/notifications/user/:userId/unread/count
```

**Response:**
```json
{
  "count": 5
}
```

### 4.4 Tạo thông báo

```
POST /api/notifications/user/:userId
```

**Body:**
```json
{
  "task_id": 1,
  "message": "Công việc 'Làm bài tập' sắp đến hạn!"
}
```

### 4.5 Tạo nhắc việc tự động

```
POST /api/notifications/user/:userId/reminders
```

> Hệ thống tự quét các task sắp/quá hạn và tạo thông báo.

### 4.6 Đánh dấu đã đọc (1 thông báo)

```
PATCH /api/notifications/:id/user/:userId/read
```

### 4.7 Đánh dấu tất cả đã đọc

```
PATCH /api/notifications/user/:userId/read-all
```

### 4.8 Xóa thông báo

```
DELETE /api/notifications/:id/user/:userId
```

---

## ⚠️ Lưu ý quan trọng cho Frontend

### Giá trị trạng thái task (status)

| Giá trị trong DB | Ý nghĩa | Frontend cũ (cần đổi) |
|-------------------|----------|------------------------|
| `pending` | Chưa bắt đầu | `not-started` ← đổi thành `pending` |
| `in_progress` | Đang thực hiện | `in-progress` ← đổi thành `in_progress` |
| `completed` | Đã hoàn thành | `completed` (giữ nguyên) |
| `overdue` | Quá hạn | `overdue` (giữ nguyên) |

### Giá trị ưu tiên (priority)

| Giá trị | Ý nghĩa |
|---------|---------|
| `low` | Thấp |
| `medium` | Trung bình |
| `high` | Cao |

### Format lỗi

Tất cả lỗi đều trả về dạng:
```json
{
  "message": "Mô tả lỗi bằng tiếng Việt"
}
```

### Xác thực & Phân quyền

Hiện tại API dùng `userId` trong URL params. Khi tích hợp JWT sau này:
- `userId` sẽ được lấy từ token thay vì URL
- Thêm header: `Authorization: Bearer <token>`

---

## 🗄️ Cấu trúc Database

```
Users (1) ──→ (N) Categories
Users (1) ──→ (N) Tasks
Users (1) ──→ (N) Notifications
Categories (1) ──→ (N) Tasks
Tasks (1) ──→ (N) Notifications
```

Xem chi tiết SQL tại [`database/init.sql`](database/init.sql).
