import type React from "react";
import { useMemo } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePlanner, selectedClasses, uniqueValues } from "@/lib/planner/store";
import {
  LOAI_LABEL,
  THU_LABEL,
  buoiOf,
  BUOI_ICON,
  tietRangeLabel,
  tietTimeLabel,
  findConflicts,
} from "@/lib/planner/schedule";
import { subjectColor } from "@/lib/planner/color";

export function ClassTable() {
  const { state, dispatch } = usePlanner();
  const { filters } = state;
  const selected = useMemo(() => selectedClasses(state), [state]);

  const selectedSubjectIds = useMemo(() => new Set(selected.map((c) => c.maMH)), [selected]);

  const loaiOptions = useMemo(() => uniqueValues(state, "loaiLop"), [state]);
  const khoaHocOptions = useMemo(() => uniqueValues(state, "khoaHoc"), [state]);
  const hocKyOptions = useMemo(() => uniqueValues(state, "hocKy"), [state]);
  const namHocOptions = useMemo(() => uniqueValues(state, "namHoc"), [state]);

  const rows = useMemo(() => {
    const list = state.allClasses.filter((c) => state.activeSubjects.has(c.maMH));

    return list.filter((c) => {
      if (filters.thu !== "all" && c.thu !== filters.thu) return false;

      const b = buoiOf(c);
      if (filters.buoi !== "all" && b !== filters.buoi) return false;
      if (filters.loai !== "all" && c.loaiLop !== filters.loai) return false;
      if (filters.khoaHoc !== "all" && (c.khoaHoc ?? "") !== filters.khoaHoc) return false;
      if (filters.hocKy !== "all" && (c.hocKy ?? "") !== filters.hocKy) return false;
      if (filters.namHoc !== "all" && (c.namHoc ?? "") !== filters.namHoc) return false;

      if (filters.search) {
        const q = filters.search.toLowerCase();
        const blob = `${c.tenMH} ${c.maMH} ${c.lop}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }

      return true;
    });
  }, [state.allClasses, state.activeSubjects, filters]);

  const subjectsSelectedCount = selectedSubjectIds.size;

  const totalCredits = useMemo(() => {
    const seen = new Set<string>();
    let total = 0;

    for (const c of selected) {
      if (seen.has(c.maMH)) continue;
      seen.add(c.maMH);

      if (typeof c.soTC === "number") total += c.soTC;
    }

    return total;
  }, [selected]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[220px] flex-1">
          <label className="text-xs text-muted-foreground">Tìm kiếm</label>
          <Input
            value={filters.search}
            onChange={(e) => dispatch({ type: "SET_FILTER", key: "search", value: e.target.value })}
            placeholder="Tên môn, mã môn, mã lớp..."
            className="h-8"
          />
        </div>

        <FilterSelect
          label="Thứ"
          value={filters.thu}
          onChange={(v) => dispatch({ type: "SET_FILTER", key: "thu", value: v })}
          options={[
            { value: "all", label: "Tất cả" },
            ...["2", "3", "4", "5", "6", "7"].map((n) => ({ value: n, label: `Thứ ${n}` })),
            { value: "*", label: "Khác (*)" },
          ]}
        />

        <FilterSelect
          label="Buổi"
          value={filters.buoi}
          onChange={(v) => dispatch({ type: "SET_FILTER", key: "buoi", value: v })}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "Sáng", label: "☀️ Sáng" },
            { value: "Chiều", label: "🌞 Chiều" },
            { value: "Tối", label: "🌚 Tối" },
          ]}
        />

        <FilterSelect
          label="Loại lớp"
          value={filters.loai}
          onChange={(v) => dispatch({ type: "SET_FILTER", key: "loai", value: v })}
          options={[
            { value: "all", label: "Tất cả" },
            ...loaiOptions.map((o) => ({ value: o, label: LOAI_LABEL[o] ?? o })),
          ]}
        />

        {khoaHocOptions.length > 0 && (
          <FilterSelect
            label="Khoá học"
            value={filters.khoaHoc}
            onChange={(v) => dispatch({ type: "SET_FILTER", key: "khoaHoc", value: v })}
            options={[
              { value: "all", label: "Tất cả" },
              ...khoaHocOptions.map((o) => ({ value: o, label: o })),
            ]}
          />
        )}

        {hocKyOptions.length > 0 && (
          <FilterSelect
            label="Học kỳ"
            value={filters.hocKy}
            onChange={(v) => dispatch({ type: "SET_FILTER", key: "hocKy", value: v })}
            options={[
              { value: "all", label: "Tất cả" },
              ...hocKyOptions.map((o) => ({ value: o, label: o })),
            ]}
          />
        )}

        {namHocOptions.length > 0 && (
          <FilterSelect
            label="Năm học"
            value={filters.namHoc}
            onChange={(v) => dispatch({ type: "SET_FILTER", key: "namHoc", value: v })}
            options={[
              { value: "all", label: "Tất cả" },
              ...namHocOptions.map((o) => ({ value: o, label: o })),
            ]}
          />
        )}
      </div>

      <div className="rounded-lg border bg-card">
        <div className="max-h-[55vh] w-full overflow-auto">
          <Table className="min-w-[1020px] table-fixed">
            <TableHeader className="sticky top-0 z-30 bg-card">
              <TableRow>
                <TableHead className="sticky left-0 z-40 w-[120px] bg-card text-center shadow-[1px_0_0_hsl(var(--border))]">
                  Chọn
                </TableHead>
                <TableHead className="w-[360px]">Môn học</TableHead>
                <TableHead className="w-[120px]">Loại</TableHead>
                <TableHead className="w-[110px]">Mã lớp</TableHead>
                <TableHead className="w-[80px]">Thứ</TableHead>
                <TableHead className="w-[130px]">Tiết</TableHead>
                <TableHead className="w-[100px]">Buổi</TableHead>
                <TableHead className="w-[110px]">Phòng</TableHead>
                <TableHead className="w-[110px]">Tuần BĐ</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((c) => {
                const isSel = state.selectedIds.has(c.id);
                const sameSubjectLocked = selectedSubjectIds.has(c.maMH) && !isSel;
                const conflicts = findConflicts(c, selected);
                const conflictWithSelected = isSel && conflicts.length > 0;
                const color = subjectColor(c.maMH);
                const b = buoiOf(c);

                const rowStyle: React.CSSProperties = isSel ? { backgroundColor: color.bg } : {};
                const stickyCellStyle: React.CSSProperties = isSel
                  ? { backgroundColor: color.bg }
                  : {};

                return (
                  <TableRow
                    key={c.id}
                    style={rowStyle}
                    className={
                      conflictWithSelected
                        ? "!bg-destructive/10"
                        : sameSubjectLocked
                          ? "opacity-60"
                          : ""
                    }
                  >
                    <TableCell
                      className="sticky left-0 z-20 w-[120px] bg-card text-center shadow-[1px_0_0_hsl(var(--border))]"
                      style={stickyCellStyle}
                    >
                      <Button
                        size="sm"
                        variant={isSel ? "default" : "outline"}
                        disabled={sameSubjectLocked}
                        className="h-7 min-w-[92px] shrink-0 whitespace-nowrap px-2"
                        onClick={() => {
                          if (sameSubjectLocked) {
                            toast.info("Môn này đã được chọn một lớp rồi.");
                            return;
                          }

                          if (!isSel) {
                            const conf = findConflicts(c, selected);

                            if (conf.length > 0) {
                              toast.warning(
                                `⚠️ Trùng TKB với ${conf.map((x) => x.tenMH).join(", ")}`,
                              );
                            }
                          }

                          dispatch({ type: "TOGGLE_CLASS", id: c.id });
                        }}
                      >
                        {isSel ? (
                          <>
                            <Check className="mr-1 h-3 w-3" />
                            Đã chọn
                          </>
                        ) : sameSubjectLocked ? (
                          <>
                            <Lock className="mr-1 h-3 w-3" />
                            Khoá
                          </>
                        ) : conflicts.length > 0 ? (
                          <>
                            <AlertTriangle className="mr-1 h-3 w-3 text-amber-600" />
                            Chọn
                          </>
                        ) : (
                          "Chọn"
                        )}
                      </Button>
                    </TableCell>

                    <TableCell className="w-[360px]">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: color.dot }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium" title={c.tenMH}>
                            {c.tenMH}
                          </div>
                          <div className="truncate font-mono text-[10px] text-muted-foreground">
                            {c.maMH}
                            {typeof c.soTC === "number" ? ` · ${c.soTC} TC` : ""}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="w-[120px]">
                      <Badge variant="outline" className="max-w-full truncate font-normal">
                        {LOAI_LABEL[c.loaiLop] ?? c.loaiLop}
                      </Badge>
                    </TableCell>

                    <TableCell className="w-[110px] truncate font-mono text-xs" title={c.lop}>
                      {c.lop}
                    </TableCell>

                    <TableCell className="w-[80px] whitespace-nowrap">{THU_LABEL(c.thu)}</TableCell>

                    <TableCell className="w-[130px] whitespace-nowrap text-xs">
                      <div>{tietRangeLabel(c)}</div>
                      <div className="truncate text-[10px] text-muted-foreground">
                        {tietTimeLabel(c)}
                      </div>
                    </TableCell>

                    <TableCell className="w-[100px] whitespace-nowrap">
                      {b ? `${BUOI_ICON[b]} ${b}` : "—"}
                    </TableCell>

                    <TableCell className="w-[110px] truncate text-xs" title={c.phong || "—"}>
                      {c.phong || "—"}
                    </TableCell>

                    <TableCell className="w-[110px] whitespace-nowrap text-xs">
                      {c.ngayBatDau || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    {state.activeSubjects.size === 0
                      ? "Chọn một hoặc nhiều môn ở thanh bên để bắt đầu."
                      : "Không có lớp nào khớp bộ lọc."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Số môn đã chọn:{" "}
        <span className="font-semibold text-foreground">{subjectsSelectedCount}</span> · Tổng lớp:{" "}
        <span className="font-semibold text-foreground">{selected.length}</span>
        {totalCredits > 0 && (
          <>
            {" · "}Tổng tín chỉ:{" "}
            <span className="font-semibold text-foreground">{totalCredits}</span>
          </>
        )}
      </div>
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
};

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
