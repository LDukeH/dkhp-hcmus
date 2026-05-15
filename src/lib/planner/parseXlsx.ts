import * as XLSX from "xlsx";
import type { ClassRow } from "./types";

const PREFERRED_SHEET = "TKB dự kiến";

function norm(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function findKey(row: Record<string, unknown>, candidates: string[]): unknown {
  const lc = candidates.map((c) => c.toLowerCase());
  for (const k of Object.keys(row)) {
    if (lc.includes(norm(k))) return row[k];
  }
  return undefined;
}

function toNum(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(",", "."));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function toStr(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) return formatDate(v);
  return String(v).trim();
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function toDateStr(v: unknown): string {
  if (v == null || v === "") return "";
  if (v instanceof Date) return formatDate(v);
  if (typeof v === "number") {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(v);
    if (d) {
      return `${String(d.d).padStart(2, "0")}/${String(d.m).padStart(2, "0")}/${d.y}`;
    }
  }
  return String(v).trim();
}

function pickSheet(wb: XLSX.WorkBook): XLSX.WorkSheet {
  if (wb.Sheets[PREFERRED_SHEET]) return wb.Sheets[PREFERRED_SHEET];
  // fallback: first sheet that has > 1 row
  for (const name of wb.SheetNames) {
    const sh = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(sh, { defval: "" });
    if (rows.length > 0) return sh;
  }
  throw new Error(`Không tìm thấy sheet "${PREFERRED_SHEET}" trong file.`);
}

/** Try to locate the header row by scanning AOA — some HCMUS files have title rows above. */
function reparseWithHeaderRow(sh: XLSX.WorkSheet): Record<string, unknown>[] {
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sh, { header: 1, defval: "", raw: true });
  let headerIdx = -1;
  for (let i = 0; i < Math.min(aoa.length, 20); i++) {
    const row = (aoa[i] || []).map((c) => norm(String(c ?? "")));
    if (
      row.some((c) => c.startsWith("mã mh") || c === "mamh" || c === "mã mh") ||
      row.some((c) => c.startsWith("tên môn") || c === "tenmh") ||
      row.some((c) => c === "thứ" || c === "thu")
    ) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) return XLSX.utils.sheet_to_json(sh, { defval: "" });
  const headers = (aoa[headerIdx] || []).map((c) => String(c ?? "").trim());
  const out: Record<string, unknown>[] = [];
  for (let i = headerIdx + 1; i < aoa.length; i++) {
    const r = aoa[i] || [];
    const obj: Record<string, unknown> = {};
    let any = false;
    for (let j = 0; j < headers.length; j++) {
      const h = headers[j];
      if (!h) continue;
      const v = r[j];
      obj[h] = v ?? "";
      if (v !== "" && v != null) any = true;
    }
    if (any) out.push(obj);
  }
  return out;
}

export async function parseTkbFile(file: File): Promise<ClassRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sh = pickSheet(wb);
  const rows = reparseWithHeaderRow(sh);

  const out: ClassRow[] = [];
  for (const r of rows) {
    const maMH = toStr(
      findKey(r, ["Mã mh", "Mã MH", "MaMH", "Ma MH", "Mã môn học"]),
    );
    const tenMH = toStr(
      findKey(r, ["Tên môn học", "TenMH", "Ten MH", "Tên môn"]),
    );
    if (!maMH || !tenMH) continue;

    const lop = toStr(findKey(r, ["Lớp", "MaLop", "Mã lớp", "Ma Lop"]));
    const loaiLop = toStr(
      findKey(r, ["Loại lớp", "HTGD", "Hình thức GD", "LoaiLop"]),
    );

    const thuRaw = findKey(r, ["Thứ", "Thu"]);
    const thu = thuRaw == null || thuRaw === "" ? "" : String(thuRaw).trim();

    const tietBatDau = toNum(findKey(r, ["Tiết bắt đầu", "TietBatDau"]));
    const soTiet = toNum(findKey(r, ["Số tiết", "SoTiet"]));
    const tietRaw = findKey(r, ["Tiết", "Tiet"]);
    const tiet =
      tietRaw == null || tietRaw === ""
        ? tietBatDau != null && soTiet != null
          ? ""
          : ""
        : String(tietRaw).trim();

    const phong = toStr(findKey(r, ["Tên phòng", "Phòng học", "PhongHoc", "Phòng"]));
    const tenGV = toStr(findKey(r, ["Tên giảng viên", "TenGV", "Giảng viên", "GV"]));
    const maGV = toStr(findKey(r, ["Mã GV", "MaGV"]));
    const siSo = findKey(r, ["Sĩ số", "SiSo"]);
    const soTC = toNum(findKey(r, ["Số TC", "SoTc", "Số tín chỉ", "Tín chỉ"]));
    const cachTuan = toStr(findKey(r, ["Cách tuần", "CachTuan"]));
    const khoaHoc = toStr(findKey(r, ["Khóa học", "Khóa", "KhoaHoc", "Khoa"]));
    const hocKy = toStr(findKey(r, ["Học kỳ", "hk", "HocKy", "HK"]));
    const namHoc = toStr(findKey(r, ["Năm học", "nh", "NamHoc", "NH"]));
    const heDT = toStr(findKey(r, ["Hệ ĐT", "HeDT", "Hệ đào tạo"]));
    const khoaQL = toStr(findKey(r, ["Khoa QL", "KhoaQL", "Khoa quản lý"]));
    const ngayBatDau = toDateStr(
      findKey(r, ["Ngày bắt đầu", "NBD", "Tuần bd", "Tuan bd", "TuanBD"]),
    );
    const ngayKetThuc = toDateStr(findKey(r, ["Ngày kết thúc", "NKT"]));
    const ghiChu = toStr(findKey(r, ["Ghi chú", "GhiChu"]));
    const ngonNgu = toStr(findKey(r, ["Ngôn ngữ", "NgonNgu"]));
    const stt = toNum(findKey(r, ["STT", "Stt"]));

    if (!thu && !tiet && tietBatDau == null) continue; // skip rows without schedule info? keep '*' rows though
    const id = `${maMH}|${loaiLop}|${lop}|${thu}|${tietBatDau ?? tiet}|${out.length}`;
    out.push({
      id,
      stt,
      maMH,
      tenMH,
      lop,
      loaiLop,
      thu: thu || "*",
      tiet,
      tietBatDau,
      soTiet,
      phong,
      tenGV,
      maGV,
      siSo: typeof siSo === "number" ? siSo : siSo ? String(siSo) : undefined,
      soTC,
      cachTuan,
      khoaHoc,
      hocKy,
      namHoc,
      heDT,
      khoaQL,
      ngayBatDau,
      ngayKetThuc,
      ghiChu,
      ngonNgu,
    });
  }
  return out;
}
