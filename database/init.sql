-- =============================================
-- File: init.sql
-- Mô tả: Tạo cấu trúc bảng cho Task Manager
-- =============================================

-- Tạo bảng Users
CREATE TABLE IF NOT EXISTS Users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    bio TEXT,
    role VARCHAR(20) DEFAULT 'user',
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Categories
CREATE TABLE IF NOT EXISTS Categories (
    category_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Tạo bảng Tasks
CREATE TABLE IF NOT EXISTS Tasks (
    task_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP,
    due_date TIMESTAMP,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_task_category FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL
);

-- Tạo bảng Notifications
CREATE TABLE IF NOT EXISTS Notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    task_id INT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_task FOREIGN KEY (task_id) REFERENCES Tasks(task_id) ON DELETE CASCADE
);

-- Tạo index để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON Tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON Tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON Tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON Tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON Categories(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON Notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON Notifications(is_read);

-- =============================================
-- Dữ liệu mẫu (Seed Data)
-- Mật khẩu mặc định cho tất cả các user mẫu là: 123456
-- (Hash bcrypt của 123456: $2a$10$wYOM5.31Xn7N/1Qd3L.ZQu.4O2/U.6X.L3.z1h/pZ/H1d8L8c2qO6)
-- =============================================

INSERT INTO Users (full_name, email, password_hash, role)
VALUES 
  ('Quản trị viên', 'admin@example.com', '$2a$10$wYOM5.31Xn7N/1Qd3L.ZQu.4O2/U.6X.L3.z1h/pZ/H1d8L8c2qO6', 'admin'),
  ('Người dùng Một', 'user1@example.com', '$2a$10$wYOM5.31Xn7N/1Qd3L.ZQu.4O2/U.6X.L3.z1h/pZ/H1d8L8c2qO6', 'user'),
  ('Người dùng Hai', 'user2@example.com', '$2a$10$wYOM5.31Xn7N/1Qd3L.ZQu.4O2/U.6X.L3.z1h/pZ/H1d8L8c2qO6', 'user'),
  ('Người dùng Ba', 'user3@example.com', '$2a$10$wYOM5.31Xn7N/1Qd3L.ZQu.4O2/U.6X.L3.z1h/pZ/H1d8L8c2qO6', 'user')
ON CONFLICT (email) DO NOTHING;
