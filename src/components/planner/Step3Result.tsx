import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { usePlanner, selectedClasses } from "@/lib/planner/store";
import {
  LOAI_LABEL,
  THU_LABEL,
  buoiOf,
  BUOI_ICON,
  hasConflict,
  tietRangeLabel,
} from "@/lib/planner/schedule";
import { subjectColor } from "@/lib/planner/color";
import { SchedulePreview } from "./SchedulePreview";
import { exportNodeAsPng } from "@/lib/planner/exportPng";

export function Step3Result() {
  const { state, dispatch } = usePlanner();
  const selected = useMemo(() => selectedClasses(state), [state]);
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const conflictPairs = useMemo(() => {
    const out: [typeof selected[number], typeof selected[number]][] = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        if (hasConflict(selected[i], selected[j])) out.push([selected[i], selected[j]]);
      }
    }
    return out;
  }, [selected]);

  const totalCredits = useMemo(() => {
    const seen = new Set<string>();
    let s = 0;
    for (const c of selected) {
      if (seen.has(c.maMH)) continue;
      seen.add(c.maMH);
      if (typeof c.soTC === "number") s += c.soTC;
    }
    return s;
  }, [selected]);

  const subjectsCount = new Set(selected.map((c) => c.maMH)).size;

  const handleExport = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      await exportNodeAsPng(previewRef.current);
      toast.success("Đã tải ảnh thời khoá biểu.");
    } catch {
      toast.error("Xuất ảnh thất bại.");
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = async () => {
    const text = selected.map((c) => c.lop).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Đã sao chép ${selected.length} mã lớp.`);
    } catch {
      toast.error("Không thể sao chép.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Kết quả đăng ký</h2>
          <p className="text-sm text-muted-foreground">
            {selected.length} lớp · {subjectsCount} môn
            {totalCredits > 0 ? ` · ${totalCredits} tín chỉ` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "SET_STEP", step: 2 })}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại chỉnh sửa
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={selected.length === 0}>
            <Copy className="mr-1 h-4 w-4" />
            Sao chép mã lớp
          </Button>
          <Button size="sm" onClick={handleExport} disabled={selected.length === 0 || exporting}>
            <Download className="mr-1 h-4 w-4" />
            {exporting ? "Đang xuất..." : "Xuất TKB (PNG)"}
          </Button>
        </div>
      </div>

      {conflictPairs.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <h3 className="text-sm font-semibold text-destructive">
            ⚠️ Còn {conflictPairs.length} cặp lớp bị trùng lịch
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            {conflictPairs.map(([a, b], i) => (
              <li key={i}>
                <span className="font-medium">{a.tenMH}</span> ({a.lop}) ↔{" "}
                <span className="font-medium">{b.tenMH}</span> ({b.lop}) — {THU_LABEL(a.thu)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Môn học</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Mã lớp</TableHead>
              <TableHead>GV</TableHead>
              <TableHead>Thứ</TableHead>
              <TableHead>Tiết</TableHead>
              <TableHead>Buổi</TableHead>
              <TableHead>Phòng</TableHead>
              <TableHead>Tuần BĐ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selected.map((c) => {
              const color = subjectColor(c.maMH);
              const b = buoiOf(c);
              return (
                <TableRow key={c.id} style={{ backgroundColor: color.bg }}>
                  <TableCell>
                    <div className="font-medium">{c.tenMH}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{c.maMH}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {LOAI_LABEL[c.loaiLop] ?? c.loaiLop}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.lop}</TableCell>
                  <TableCell className="text-xs">{c.tenGV || "—"}</TableCell>
                  <TableCell>{THU_LABEL(c.thu)}</TableCell>
                  <TableCell className="text-xs">{tietRangeLabel(c)}</TableCell>
                  <TableCell>{b ? `${BUOI_ICON[b]} ${b}` : "—"}</TableCell>
                  <TableCell className="text-xs">{c.phong || "—"}</TableCell>
                  <TableCell className="text-xs">{c.ngayBatDau || "—"}</TableCell>
                </TableRow>
              );
            })}
            {selected.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có lớp nào được chọn.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SchedulePreview ref={previewRef} />
    </div>
  );
}
