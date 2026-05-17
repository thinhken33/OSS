const crypto = require("crypto");

const SECRET_MAC_DINH = "taskflow-secret-change-in-production";
const BI_MAT_TOKEN = process.env.AUTH_SECRET || process.env.JWT_SECRET || SECRET_MAC_DINH;
const TTL_GIAY = Number.parseInt(process.env.AUTH_TOKEN_TTL_SECONDS || "604800", 10);

function maHoaBase64Url(giaTri) {
  const duLieu = typeof giaTri === "string" ? giaTri : JSON.stringify(giaTri);
  return Buffer.from(duLieu, "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function giaiMaBase64Url(giaTri) {
  const duLieu = giaTri.replace(/-/g, "+").replace(/_/g, "/");
  const phanDu = duLieu.length % 4;
  const daThemDauBang = phanDu ? duLieu + "=".repeat(4 - phanDu) : duLieu;
  return Buffer.from(daThemDauBang, "base64").toString("utf8");
}

function taoChuKy(duLieu) {
  return crypto
    .createHmac("sha256", BI_MAT_TOKEN)
    .update(duLieu)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function soSanhAnToan(chuKyA, chuKyB) {
  const a = Buffer.from(chuKyA || "");
  const b = Buffer.from(chuKyB || "");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function taoAccessToken(nguoiDung) {
  const bayGio = Math.floor(Date.now() / 1000);
  const ttlHopLe = Number.isFinite(TTL_GIAY) && TTL_GIAY > 0 ? TTL_GIAY : 604800;
  const hetHan = bayGio + ttlHopLe;

  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    user_id: nguoiDung.user_id,
    role: nguoiDung.role || "user",
    iat: bayGio,
    exp: hetHan,
  };

  const phanDau = maHoaBase64Url(header);
  const phanThan = maHoaBase64Url(payload);
  const duLieuChuKy = `${phanDau}.${phanThan}`;
  const chuKy = taoChuKy(duLieuChuKy);
  return `${duLieuChuKy}.${chuKy}`;
}

function xacThucAccessToken(token) {
  if (!token || typeof token !== "string") {
    const loi = new Error("TOKEN_MISSING");
    loi.code = "TOKEN_MISSING";
    throw loi;
  }

  const phan = token.split(".");
  if (phan.length !== 3) {
    const loi = new Error("TOKEN_INVALID");
    loi.code = "TOKEN_INVALID";
    throw loi;
  }

  const [phanDau, phanThan, chuKy] = phan;
  const duLieuChuKy = `${phanDau}.${phanThan}`;
  const chuKyHopLe = taoChuKy(duLieuChuKy);

  if (!soSanhAnToan(chuKy, chuKyHopLe)) {
    const loi = new Error("TOKEN_INVALID");
    loi.code = "TOKEN_INVALID";
    throw loi;
  }

  let payload;
  try {
    payload = JSON.parse(giaiMaBase64Url(phanThan));
  } catch {
    const loi = new Error("TOKEN_INVALID");
    loi.code = "TOKEN_INVALID";
    throw loi;
  }

  if (!payload || typeof payload.user_id !== "number") {
    const loi = new Error("TOKEN_INVALID");
    loi.code = "TOKEN_INVALID";
    throw loi;
  }

  const bayGio = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp <= bayGio) {
    const loi = new Error("TOKEN_EXPIRED");
    loi.code = "TOKEN_EXPIRED";
    throw loi;
  }

  return payload;
}

module.exports = {
  taoAccessToken,
  xacThucAccessToken,
};

