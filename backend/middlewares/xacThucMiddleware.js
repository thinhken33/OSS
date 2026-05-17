const { xacThucAccessToken } = require("../utils/authToken");

function layTokenTuHeader(req) {
  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return null;
  return authorization.slice(7).trim();
}

function xacThucDangNhap(req, res, next) {
  const token = layTokenTuHeader(req);
  if (!token) {
    return res.status(401).json({ message: "Vui long dang nhap de tiep tuc." });
  }

  try {
    const payload = xacThucAccessToken(token);
    req.nguoiDungDangNhap = payload;
    return next();
  } catch (loi) {
    if (loi.code === "TOKEN_EXPIRED") {
      return res.status(401).json({ message: "Phien dang nhap da het han. Vui long dang nhap lai." });
    }
    return res.status(401).json({ message: "Token khong hop le." });
  }
}

function layIdHopLe(rawId) {
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function xacThucTrungKhopUserParam(tenParam = "userId", choPhepAdmin = false) {
  return function middleware(req, res, next) {
    const userIdTuParam = layIdHopLe(req.params[tenParam]);
    if (!userIdTuParam) {
      return res.status(400).json({ message: "ID nguoi dung khong hop le." });
    }

    const userDangNhap = req.nguoiDungDangNhap;
    if (!userDangNhap) {
      return res.status(401).json({ message: "Vui long dang nhap de tiep tuc." });
    }

    if (userDangNhap.user_id === userIdTuParam) {
      return next();
    }

    if (choPhepAdmin && userDangNhap.role === "admin") {
      return next();
    }

    return res.status(403).json({
      message: "Ban khong co quyen truy cap du lieu cua nguoi dung khac.",
    });
  };
}

function yeuCauQuyenAdmin(req, res, next) {
  if (req.nguoiDungDangNhap?.role !== "admin") {
    return res.status(403).json({ message: "Chi admin moi co quyen thuc hien thao tac nay." });
  }
  return next();
}

module.exports = {
  xacThucDangNhap,
  xacThucTrungKhopUserParam,
  yeuCauQuyenAdmin,
};

