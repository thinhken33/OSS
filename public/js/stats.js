// ===== THỐNG KÊ (STATISTICS) =====
async function taiThongKe() {
  const dem = {
    tong: danhSachCongViec.length,
    chuaBatDau: 0,
    dangLam: 0,
    hoanThanh: 0,
    quaHan: 0,
  };
  danhSachCongViec.forEach((cv) => {
    const tt = layTrangThaiFE(cv);
    if (tt === "not-started") dem.chuaBatDau++;
    else if (tt === "in-progress") dem.dangLam++;
    else if (tt === "completed") dem.hoanThanh++;
    else if (tt === "overdue") dem.quaHan++;
  });
  $("tkTong").textContent = dem.tong;
  $("tkChuaBatDau").textContent = dem.chuaBatDau;
  $("tkDangLam").textContent = dem.dangLam;
  $("tkHoanThanh").textContent = dem.hoanThanh;
  $("tkQuaHan").textContent = dem.quaHan;
  $("tkTiLe").textContent = dem.tong
    ? Math.round((dem.hoanThanh / dem.tong) * 100) + "%"
    : "0%";

  const max = Math.max(
    dem.chuaBatDau,
    dem.dangLam,
    dem.hoanThanh,
    dem.quaHan,
    1,
  );
  $("bieuDoThongKe").innerHTML = [
    { nhan: "Cần làm", so: dem.chuaBatDau, lop: "gray" },
    { nhan: "Đang làm", so: dem.dangLam, lop: "orange" },
    { nhan: "Hoàn thành", so: dem.hoanThanh, lop: "green" },
    { nhan: "Quá hạn", so: dem.quaHan, lop: "red" },
  ]
    .map(
      (d) => `
    <div class="chart-bar-row">
      <div class="chart-bar-label">${d.nhan}</div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill ${d.lop}" style="width:${Math.max((d.so / max) * 100, d.so ? 8 : 0)}%">${d.so}</div>
      </div>
    </div>
  `,
    )
    .join("");
}
