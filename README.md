# 📌 Web App Quản Lý Công Việc Cá Nhân

## 1. 🧭 Tổng quan dự án

Dự án là một ứng dụng web hỗ trợ quản lý công việc cá nhân, giúp người dùng lập kế hoạch, theo dõi tiến độ và hoàn thành công việc hiệu quả hơn.

Hệ thống cho phép người dùng:

- Đăng ký, đăng nhập tài khoản
- Tạo, chỉnh sửa, xóa công việc
- Phân loại công việc theo trạng thái, mức độ ưu tiên, danh mục
- Đặt thời hạn hoàn thành
- Tìm kiếm và lọc công việc theo nhiều tiêu chí
- Nhận thông báo nhắc việc sắp đến hạn hoặc quá hạn
- Xem thống kê tổng quan hiệu suất làm việc
- Quản trị tài khoản người dùng (vai trò admin)

## 2. 🎯 Mục tiêu hệ thống

- Hỗ trợ quản lý công việc khoa học và có cấu trúc
- Giảm tình trạng quên việc nhờ chế độ nhắc hạn
- Tăng khả năng theo dõi tiến độ và đánh giá hiệu quả cá nhân
- Đảm bảo dữ liệu được lưu trữ an toàn, truy cập theo đúng quyền

## 3. 🛠️ Công nghệ sử dụng

### Frontend

- React.js
- Vite
- JavaScript

### Backend

- Node.js
- Express.js
- JavaScript

### Database

- PostgreSQL

## 4. ✅ Chức năng chính

### 4.1 🔐 Đăng ký

Người dùng có thể tạo tài khoản mới với các thông tin:

- Họ và tên
- Email
- Mật khẩu
- Xác nhận mật khẩu

Điều kiện và ràng buộc:

- Email không được trùng
- Email đúng định dạng
- Mật khẩu phải đạt mức độ mạnh tối thiểu
- Mật khẩu xác nhận phải trùng khớp

Kết quả: Tài khoản mới được tạo, người dùng có thể đăng nhập.

### 4.2 🔑 Đăng nhập

Người dùng đăng nhập bằng:

- Email
- Mật khẩu

Hỗ trợ:

- Quên mật khẩu
- Chuyển hướng tạo tài khoản nếu chưa có

Ngoại lệ:

- Sai thông tin đăng nhập
- Lỗi hệ thống trong quá trình xác thực
- Có thể khóa tạm thời nếu đăng nhập sai nhiều lần

Kết quả: Đăng nhập thành công và truy cập vào trang chủ.

### 4.3 👤 Thông tin cá nhân

Người dùng đã đăng nhập có thể:

- Xem thông tin cá nhân (họ tên, email, ảnh đại diện, mô tả)
- Chỉnh sửa thông tin cá nhân
- Đổi mật khẩu
- Xem thống kê công việc cá nhân (đã tạo, đang thực hiện, đã hoàn thành, quá hạn)

### 4.4 📝 Tạo và quản lý công việc

Mỗi công việc gồm các trường:

- Tiêu đề
- Mô tả
- Ngày bắt đầu
- Hạn hoàn thành
- Mức ưu tiên
- Danh mục
- Trạng thái

Trạng thái công việc:

- Chưa bắt đầu
- Đang thực hiện
- Đã hoàn thành
- Quá hạn

Hệ thống hỗ trợ:

- Thêm công việc
- Chỉnh sửa công việc
- Xóa công việc
- Cập nhật trạng thái công việc

Ràng buộc dữ liệu:

- Tiêu đề không được để trống
- Hạn hoàn thành không nhỏ hơn ngày bắt đầu
- Dữ liệu nhập vào phải hợp lệ

### 4.5 🔄 Cập nhật trạng thái công việc

Người dùng có thể thay đổi trạng thái theo tiến độ thực tế.

Quy tắc bổ sung:

- Nếu chuyển sang trạng thái Đã hoàn thành, hệ thống lưu thời điểm hoàn thành
- Nếu công việc quá hạn mà chưa hoàn thành, hệ thống có thể tự động đánh dấu Quá hạn

### 4.6 🗂️ Quản lý danh mục công việc

Người dùng có thể tạo, sửa, xóa danh mục để sắp xếp công việc, ví dụ:

- Học tập
- Cá nhân
- Công việc
- Mua sắm
- Sức khỏe

Ràng buộc:

- Tên danh mục không được trùng
- Tên danh mục không được để trống

### 4.7 🔎 Tìm kiếm và lọc công việc

Hệ thống cho phép tìm kiếm và lọc theo:

- Từ khóa
- Trạng thái
- Mức độ ưu tiên
- Danh mục
- Ngày hết hạn

Người dùng có thể kết hợp nhiều bộ lọc đồng thời.
Chỉ hiển thị công việc thuộc tài khoản hiện tại.

### 4.8 🔔 Thông báo nhắc việc

Hệ thống tạo thông báo cho các công việc:

- Sắp đến hạn
- Đã quá hạn

Thông báo được hiển thị trong khu vực thông báo của người dùng.
Người dùng có thể đánh dấu đã đọc.
Chỉ gửi thông báo cho chủ sở hữu công việc.

### 4.9 📊 Thống kê công việc

Người dùng xem tổng quan:

- Số công việc chưa bắt đầu
- Số công việc đang thực hiện
- Số công việc đã hoàn thành
- Số công việc quá hạn

Hệ thống có thể hiển thị:

- Số liệu tổng hợp theo ngày/tuần/tháng
- Biểu đồ thống kê

Nếu chưa có dữ liệu, hiển thị trạng thái rỗng hoặc thông báo phù hợp.

### 4.10 🛡️ Quản trị người dùng (Admin)

Quản trị viên có thể:

- Xem danh sách tài khoản người dùng
- Khóa tài khoản
- Mở khóa tài khoản

Điều kiện:

- Chỉ tài khoản có quyền admin mới truy cập được chức năng này

## 5. 📚 Tóm tắt use case

### Use case 1: Đăng ký

- Tác nhân: Người dùng
- Tiền điều kiện: Chưa có tài khoản
- Hậu điều kiện: Tài khoản mới được tạo

### Use case 2: Đăng nhập

- Tác nhân: Người dùng
- Tiền điều kiện: Đã có tài khoản
- Hậu điều kiện: Truy cập thành công vào hệ thống

### Use case 3: Xem/cập nhật thông tin cá nhân

- Tác nhân: Người dùng đã đăng nhập
- Tiền điều kiện: Đã đăng nhập
- Hậu điều kiện: Thông tin cá nhân được cập nhật

### Use case 4: Tạo công việc

- Tác nhân: Người dùng đã đăng nhập
- Tiền điều kiện: Đã đăng nhập
- Hậu điều kiện: Công việc mới được lưu và hiển thị

### Use case 5: Cập nhật trạng thái công việc

- Tác nhân: Người dùng đã đăng nhập
- Tiền điều kiện: Đã có công việc
- Hậu điều kiện: Trạng thái công việc được cập nhật

### Use case 6: Quản lý danh mục

- Tác nhân: Người dùng đã đăng nhập
- Tiền điều kiện: Đã đăng nhập
- Hậu điều kiện: Danh mục được tạo/sửa/xóa thành công

### Use case 7: Tìm kiếm và lọc công việc

- Tác nhân: Người dùng
- Tiền điều kiện: Đã đăng nhập
- Hậu điều kiện: Danh sách công việc hiển thị đúng tiêu chí

### Use case 8: Nhắc việc

- Tác nhân: Hệ thống và Người dùng
- Tiền điều kiện: Đã có công việc có hạn
- Hậu điều kiện: Thông báo được tạo và hiển thị

### Use case 9: Xem thống kê công việc

- Tác nhân: Người dùng
- Tiền điều kiện: Đã đăng nhập và có dữ liệu
- Hậu điều kiện: Báo cáo thống kê được hiển thị

### Use case 10: Quản lý người dùng

- Tác nhân: Quản trị viên
- Tiền điều kiện: Đã đăng nhập với quyền admin
- Hậu điều kiện: Trạng thái tài khoản người dùng được cập nhật

## 6. 🖥️ Các trang giao diện

- Trang đăng nhập
- Trang đăng ký
- Trang chủ
- Trang danh sách công việc
- Trang thêm công việc
- Trang chỉnh sửa công việc
- Trang chi tiết công việc
- Trang danh mục công việc
- Trang thông báo
- Trang thống kê
- Trang cá nhân
- Trang quản trị người dùng

## 7. 🔒 Ràng buộc và bảo mật

- Người dùng chỉ được phép thao tác dữ liệu của chính mình
- Các chức năng yêu cầu đăng nhập phải được bảo vệ bằng cơ chế xác thực
- Phân quyền rõ ràng giữa người dùng thường và quản trị viên
- Kiểm tra dữ liệu đầu vào ở cả frontend và backend

## 8. 🚀 Định hướng triển khai

- Ứng dụng hướng tới kiến trúc tách biệt frontend/backend
- API REST được xây dựng bằng Express.js
- Dữ liệu được lưu trữ quan hệ trong PostgreSQL
- Frontend React + Vite tối ưu trải nghiệm và tốc độ phản hồi

## 9. 🧩 Kết luận

Dự án Web App Quản Lý Công Việc Cá Nhân cung cấp đầy đủ các chức năng cần thiết để người dùng quản lý công việc hiệu quả: từ tạo tài khoản, quản lý công việc, nhắc hạn, thống kê đến quản trị hệ thống. Kiến trúc React + Node.js + Express + PostgreSQL đảm bảo tính linh hoạt, dễ mở rộng và phù hợp cho quá trình phát triển thực tế.

## 10. 📄 Giấy phép

Dự án này được phát hành theo giấy phép **MIT License**.

Bạn được phép:

- Sử dụng cho mục đích cá nhân hoặc thương mại
- Sao chép, chỉnh sửa, hợp nhất, phát hành và phân phối lại mã nguồn
- Cấp phép lại hoặc bán phần mềm

Điều kiện bắt buộc:

- Phải giữ nguyên thông báo bản quyền và thông báo giấy phép MIT trong mọi bản sao hoặc phần quan trọng của phần mềm

Miễn trừ trách nhiệm:

- Phần mềm được cung cấp "as is", không có bất kỳ bảo đảm nào

Xem toàn văn giấy phép tại [LICENSE](LICENSE).
