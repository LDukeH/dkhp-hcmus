import type { ClassRow } from "./types";

export const LOAI_LABEL: Record<string, string> = {
  LT: "Lý thuyết",
  TH: "Thực hành",
  nBT: "Bài tập",
  nTH: "Thực hành nhóm",
  HT1: "Học tập 1",
  HT2: "Học tập 2",
  ĐA: "Đồ án",
  TTTN: "Thực tập tốt nghiệp",
  KLTN: "Khoá luận tốt nghiệp",
};

export const THU_LABEL = (n: string | number) => {
  const s = String(n);
  if (!s || s === "*") return "—";
  return `Thứ ${s}`;
};

export type Buoi = "Sáng" | "Chiều" | "Tối";
export const BUOI_ICON: Record<Buoi, string> = {
  Sáng: "☀️",
  Chiều: "🌞",
  Tối: "🌚",
};

// Theory: 1 period each
export const THEORY_PERIOD_MAP: Record<number, string> = {
  1: "7g30-8g20",
  2: "8g20-9g10",
  3: "9g10-10g00",
  4: "10g10-11g00",
  5: "11g00-11g50",
  6: "12g40-13g30",
  7: "13g30-14g20",
  8: "14g20-15g10",
  9: "15g20-16g10",
  10: "16g10-17g00",
};

// Practical / tutorial: 2 ca per session, 2.5 periods each
export const PRACTICAL_SLOT_MAP: Record<
  string,
  { label: string; time: string; periods: string[]; firstPeriod: number }
> = {
  "1": {
    label: "Tiết 1 → giữa tiết 3",
    time: "7g30-9g35",
    periods: ["1", "2", "3A"],
    firstPeriod: 1,
  },
  "3.5": {
    label: "Giữa tiết 3 → tiết 5",
    time: "9g45-11g50",
    periods: ["3B", "4", "5"],
    firstPeriod: 3,
  },
  "6": {
    label: "Tiết 6 → giữa tiết 8",
    time: "12g40-14g45",
    periods: ["6", "7", "8A"],
    firstPeriod: 6,
  },
  "8.5": {
    label: "Giữa tiết 8 → tiết 10",
    time: "14g55-17g00",
    periods: ["8B", "9", "10"],
    firstPeriod: 8,
  },
};

const PRACTICAL_TYPES = new Set(["TH", "nTH", "nBT", "HT1", "HT2"]);
export function isPracticalType(loai: string): boolean {
  return PRACTICAL_TYPES.has(loai);
}

/** Returns occupied period tokens (e.g. ["1","2","3A"] or ["6","7","8"]). */
export function getOccupiedPeriods(row: ClassRow): string[] {
  if (!row.thu || row.thu === "*") return [];
  const isPractical = isPracticalType(row.loaiLop);

  // Case 1: numeric tietBatDau + soTiet
  if (row.tietBatDau != null && row.soTiet != null && row.soTiet > 0) {
    if (isPractical) {
      const slot = PRACTICAL_SLOT_MAP[String(row.tietBatDau)];
      if (slot) return slot.periods;
    }
    const out: string[] = [];
    const start = Math.floor(row.tietBatDau);
    for (let i = 0; i < row.soTiet; i++) out.push(String(start + i));
    return out;
  }

  // Case 2: raw tiet string like "1234", "678", "9,10", "3.5"
  const t = (row.tiet ?? "").trim();
  if (!t || t === "*") return [];
  if (t.includes(",")) return t.split(",").map((x) => x.trim()).filter(Boolean);
  // handle decimal practical anchor in raw string
  if (PRACTICAL_SLOT_MAP[t]) return PRACTICAL_SLOT_MAP[t].periods;
  // handle "10" specially since it's two chars
  if (t === "10") return ["10"];
  // expand "1234" → ["1","2","3","4"], handle trailing 10
  const out: string[] = [];
  let i = 0;
  while (i < t.length) {
    if (t[i] === "1" && t[i + 1] === "0") {
      out.push("10");
      i += 2;
    } else if (/\d/.test(t[i])) {
      out.push(t[i]);
      i += 1;
    } else {
      i += 1;
    }
  }
  return out;
}

export function periodNumeric(p: string): number {
  // "3A" / "3B" -> 3
  return parseInt(p, 10);
}

export function firstPeriodNumber(c: ClassRow): number | null {
  const ps = getOccupiedPeriods(c);
  if (!ps.length) return null;
  const n = periodNumeric(ps[0]);
  return Number.isFinite(n) ? n : null;
}

export function buoiOf(c: ClassRow): Buoi | null {
  const n = firstPeriodNumber(c);
  if (n == null) return null;
  if (n >= 11) return "Tối";
  if (n >= 6) return "Chiều";
  return "Sáng";
}

export function tietRangeLabel(c: ClassRow): string {
  if (isPracticalType(c.loaiLop) && c.tietBatDau != null) {
    const slot = PRACTICAL_SLOT_MAP[String(c.tietBatDau)];
    if (slot) return slot.label;
  }
  const ps = getOccupiedPeriods(c);
  if (!ps.length) return "—";
  if (ps.length === 1) return `Tiết ${ps[0]}`;
  return `Tiết ${ps[0]}–${ps[ps.length - 1]} (${ps.length})`;
}

export function tietTimeLabel(c: ClassRow): string {
  if (isPracticalType(c.loaiLop) && c.tietBatDau != null) {
    const slot = PRACTICAL_SLOT_MAP[String(c.tietBatDau)];
    if (slot) return slot.time;
  }
  const ps = getOccupiedPeriods(c).map(periodNumeric).filter((n) => Number.isFinite(n));
  if (!ps.length) return "";
  const start = THEORY_PERIOD_MAP[ps[0]];
  const end = THEORY_PERIOD_MAP[ps[ps.length - 1]];
  if (!start || !end) return "";
  const s = start.split("-")[0];
  const e = end.split("-")[1];
  return `${s}-${e}`;
}

export function hasConflict(a: ClassRow, b: ClassRow): boolean {
  if (a.id === b.id) return false;
  if (!a.thu || !b.thu) return false;
  if (a.thu === "*" || b.thu === "*") return false;
  if (a.thu !== b.thu) return false;
  const ap = getOccupiedPeriods(a);
  const bp = getOccupiedPeriods(b);
  if (!ap.length || !bp.length) return false;
  const set = new Set(bp);
  return ap.some((p) => set.has(p));
}

export function findConflicts(target: ClassRow, others: ClassRow[]): ClassRow[] {
  return others.filter((o) => hasConflict(target, o));
}
