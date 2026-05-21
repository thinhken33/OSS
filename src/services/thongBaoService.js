const thongBaoModel = require("../models/thongBaoModel");
const congViecModel = require("../models/congViecModel");

/**
 * Tiện ích: Tạo đối tượng lỗi (Error) với HTTP Code
 * 
 * @param {string} thongBao - Nội dung mô tả lỗi
 * @param {number} maLoi - Mã trạng thái HTTP
 * @returns {Error}
 */
function taoLoi(thongBao, maLoi) {
  const loi = new Error(thongBao);
  loi.statusCode = maLoi;
  return loi;
}

/**
 * Lấy danh sách toàn bộ thông báo (cả đọc và chưa đọc)
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>}
 */
async function layThongBaoTheoNguoiDung(maNguoiDung) {
  return await thongBaoModel.layThongBaoTheoNguoiDung(maNguoiDung);
}

/**
 * Lấy các thông báo chưa đọc
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>}
 */
async function layThongBaoChuaDoc(maNguoiDung) {
  return await thongBaoModel.layThongBaoChuaDoc(maNguoiDung);
}

/**
 * Đếm số thông báo chưa đọc để hiển thị số lượng (badge)
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<number>}
 */
async function demThongBaoChuaDoc(maNguoiDung) {
  return await thongBaoModel.demThongBaoChuaDoc(maNguoiDung);
}

/**
 * Tạo một thông báo mới
 * 
 * @param {Object} duLieu - Bao gồm user_id, task_id (có thể trống), message
 * @throws {Error} Nếu không có message
 * @returns {Promise<Object>}
 */
async function taoThongBao({ user_id, task_id, message }) {
  if (!message || !message.trim()) {
    throw taoLoi("Nội dung thông báo không được để trống.", 400);
  }

  return await thongBaoModel.taoThongBao({
    user_id,
    task_id: task_id || null,
    message: message.trim(),
  });
}

/**
 * Đánh dấu một thông báo là đã đọc
 * 
 * @param {number} maThongBao - ID thông báo
 * @param {number} maNguoiDung - ID người dùng sở hữu thông báo (dùng để xác thực quyền)
 * @throws {Error} 404 nếu không tìm thấy, 403 nếu cố đánh dấu thông báo của người khác
 * @returns {Promise<Object>}
 */
async function danhDauDaDoc(maThongBao, maNguoiDung) {
  const thongBaoHienTai = await thongBaoModel.layThongBaoTheoId(maThongBao);
  if (!thongBaoHienTai) {
    throw taoLoi("Không tìm thấy thông báo.", 404);
  }

  // Đảm bảo tính bảo mật (chỉ người chủ của thông báo mới được phép đánh dấu)
  if (thongBaoHienTai.user_id !== maNguoiDung) {
    throw taoLoi("Bạn không có quyền thao tác thông báo này.", 403);
  }

  return await thongBaoModel.danhDauDaDoc(maThongBao);
}

/**
 * Đánh dấu tất cả thông báo của user thành trạng thái "Đã đọc"
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>}
 */
async function danhDauTatCaDaDoc(maNguoiDung) {
  return await thongBaoModel.danhDauTatCaDaDoc(maNguoiDung);
}

/**
 * Xoá một thông báo cụ thể
 * 
 * @param {number} maThongBao - ID thông báo
 * @param {number} maNguoiDung - ID người dùng
 * @throws {Error} 404 hoặc 403
 * @returns {Promise<Object>} Thông báo vừa xoá
 */
async function xoaThongBao(maThongBao, maNguoiDung) {
  const thongBaoHienTai = await thongBaoModel.layThongBaoTheoId(maThongBao);
  if (!thongBaoHienTai) {
    throw taoLoi("Không tìm thấy thông báo để xoá.", 404);
  }

  if (thongBaoHienTai.user_id !== maNguoiDung) {
    throw taoLoi("Bạn không có quyền xoá thông báo này.", 403);
  }

  await thongBaoModel.xoaThongBao(maThongBao);
  return thongBaoHienTai;
}

/**
 * Tự động tạo thông báo nhắc nhở cho các công việc sắp tới hạn (trong vòng 1 ngày) hoặc đã quá hạn
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Array>} Danh sách các thông báo đã được tạo
 */
async function taoThongBaoNhacViec(maNguoiDung) {
  const danhSachCongViec = await congViecModel.layCongViecQuaHanVaSapDenHan(maNguoiDung);
  const danhSachThongBao = [];
  const thongBaoHienTai = await thongBaoModel.layThongBaoTheoNguoiDung(maNguoiDung);

  for (const congViec of danhSachCongViec) {
    const bayGio = new Date();
    const hanHoanThanh = congViec.due_date ? new Date(congViec.due_date) : null;
    const cacNoiDungCanTao = [];

    // Phân loại nội dung thông báo dựa vào hạn của công việc
    if (hanHoanThanh && hanHoanThanh < bayGio) {
      cacNoiDungCanTao.push({
        idDupl: 'quahan',
        message: `⚠️ Công việc "${congViec.title}" đã quá hạn! Bạn hãy kiểm tra lại nhé.`
      });
    } else {
      // Cảnh báo: Loại bỏ rào cản ngày bắt đầu để cho phép thông báo sớm
      
      const danhSachThoiGian = Array.isArray(congViec.notification_times) ? congViec.notification_times : [];
      
      if (danhSachThoiGian.length > 0) {
        for (const nt of danhSachThoiGian) {
          if (new Date(nt) <= bayGio) {
            const ndt = new Date(nt);
            const mocThoiGian = ndt.toLocaleString("vi-VN", { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' });
            const han = hanHoanThanh ? hanHoanThanh.toLocaleString("vi-VN", { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric'}) : 'Không có';
            
            let laMocBatDau = false;
            const sdt = congViec.start_date ? new Date(congViec.start_date) : null;
            if (sdt) {
                const diffMsStart = sdt - ndt;
                if (diffMsStart >= 0) {
                    const dMinS = Math.round(diffMsStart / 60000);
                    const dHoursS = Math.round(diffMsStart / 3600000);
                    const dDaysS = Math.round(diffMsStart / 86400000);
                    if (dDaysS > 0 && dDaysS % 30 === 0) laMocBatDau = true;
                    else if (dDaysS > 0 && dDaysS % 7 === 0) laMocBatDau = true;
                    else if (dHoursS > 0 && dHoursS % 24 === 0) laMocBatDau = true;
                    else if (dMinS > 0 && dMinS % 60 === 0) laMocBatDau = true;
                    else if (dMinS > 0) laMocBatDau = true;
                }
            }
            
            let message = "";
            if (laMocBatDau) {
                const batDau = sdt.toLocaleString("vi-VN", { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                message = `🚀 Lịch hẹn (${mocThoiGian}): Nhắc BẮT ĐẦU công việc "${congViec.title}" (Giờ bắt đầu: ${batDau}).`;
            } else {
                message = `⏰ Lịch hẹn (${mocThoiGian}): Nhắc HOÀN THÀNH công việc "${congViec.title}" (Hạn chót: ${han}).`;
            }

            cacNoiDungCanTao.push({
              idDupl: `hen_${mocThoiGian}`,
              message: message
            });
          }
        }
      } else if (hanHoanThanh) {
        // Mặc định nhắc trước 1 ngày nếu không có cài đặt custom
        if (hanHoanThanh - bayGio <= 24 * 60 * 60 * 1000) {
          cacNoiDungCanTao.push({
            idDupl: '1ngay',
            message: `⏳ Chỉ còn chưa tới 1 ngày nữa là đến hạn công việc "${congViec.title}" (${hanHoanThanh.toLocaleDateString("vi-VN")}).`
          });
        }
      }
    }

    for (const nd of cacNoiDungCanTao) {
      // Kiểm tra xem thông báo này đã được tạo trước đó chưa (dựa vào mốc thời gian hoặc loại thông báo thay vì chuỗi string chính xác)
      const daTonTai = thongBaoHienTai.some((tb) => {
        if (tb.task_id !== congViec.task_id) return false;
        if (nd.idDupl === 'quahan') return tb.message.includes('đã quá hạn!');
        if (nd.idDupl === '1ngay') return tb.message.includes('Chỉ còn chưa tới 1 ngày nữa');
        if (nd.idDupl.startsWith('hen_')) {
          const m = nd.idDupl.replace('hen_', '');
          return tb.message.includes(`(${m})`);
        }
        return tb.message === nd.message;
      });
      if (daTonTai) continue;

      // Ghi vào CSDL
      const thongBaoMoi = await thongBaoModel.taoThongBao({
        user_id: maNguoiDung,
        task_id: congViec.task_id,
        message: nd.message,
      });
      danhSachThongBao.push(thongBaoMoi);
      thongBaoHienTai.push(thongBaoMoi);
    }
  }

  return danhSachThongBao;
}

/**
 * Xoá tất cả thông báo của người dùng
 * 
 * @param {number} maNguoiDung - ID người dùng
 * @returns {Promise<Object>} Thông tin xoá
 */
async function xoaTatCaThongBao(maNguoiDung) {
  await thongBaoModel.xoaTatCaThongBao(maNguoiDung);
  return { success: true };
}

module.exports = {
  layThongBaoTheoNguoiDung,
  layThongBaoChuaDoc,
  demThongBaoChuaDoc,
  taoThongBao,
  danhDauDaDoc,
  danhDauTatCaDaDoc,
  xoaThongBao,
  taoThongBaoNhacViec,
  xoaTatCaThongBao,
};
