export type ClassRow = {
  id: string;
  stt?: number;
  maMH: string;
  tenMH: string;
  lop: string; // = MaLop
  tenGV?: string;
  maGV?: string;
  siSo?: string | number;
  soTC?: number;
  loaiLop: string; // LT | TH | nBT | nTH | HT1 | HT2 | ĐA | TTTN | KLTN ...
  thu: string; // "2".."7" or "*"
  tiet: string; // raw period string e.g. "1234", "678", "3.5", "*"
  tietBatDau?: number;
  soTiet?: number;
  cachTuan?: string;
  phong?: string;
  khoaHoc?: string;
  hocKy?: string;
  namHoc?: string;
  heDT?: string;
  khoaQL?: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  ghiChu?: string;
  ngonNgu?: string;
};

export type Filters = {
  thu: string;
  buoi: string;
  loai: string;
  khoaHoc: string;
  hocKy: string;
  namHoc: string;
  search: string;
};

export type AppState = {
  step: 1 | 2 | 3;
  allClasses: ClassRow[];
  activeSubjects: Set<string>;
  selectedIds: Set<string>;
  filters: Filters;
};

export type Action =
  | { type: "LOAD"; rows: ClassRow[] }
  | { type: "SET_STEP"; step: 1 | 2 | 3 }
  | { type: "TOGGLE_SUBJECT"; maMH: string }
  | { type: "SET_SUBJECTS"; ids: string[] }
  | { type: "TOGGLE_CLASS"; id: string }
  | { type: "SET_FILTER"; key: keyof Filters; value: string }
  | { type: "RESET" };
