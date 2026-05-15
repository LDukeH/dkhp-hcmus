import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, FileSpreadsheet } from "lucide-react";
import { parseTkbFile } from "@/lib/planner/parseXlsx";
import { usePlanner } from "@/lib/planner/store";

export function Step1Upload() {
  const { dispatch } = usePlanner();
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        toast.error("Vui lòng chọn file .xlsx");
        return;
      }
      setLoading(true);
      try {
        const rows = await parseTkbFile(file);
        if (rows.length === 0) {
          toast.error("Không đọc được dữ liệu lớp học từ file.");
          return;
        }
        dispatch({ type: "LOAD", rows });
        toast.success(`Đã tải ${rows.length} dòng lớp học.`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi đọc file");
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-primary-foreground shadow-sm">
            <span className="text-lg font-bold tracking-tight">KHTN · ĐHQG-HCM</span>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
            Lập thời khoá biểu học phần
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tải lên file Excel kế hoạch mở học phần (sheet <code className="rounded bg-muted px-1.5 py-0.5">TKB dự kiến</code>) để bắt đầu chọn lớp.
          </p>
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void handleFile(f);
          }}
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-card px-6 py-12 transition-colors",
            dragOver
              ? "border-primary bg-accent"
              : "border-border hover:border-primary/50 hover:bg-accent/40",
          ].join(" ")}
        >
          <div className="rounded-full bg-accent p-3 text-primary">
            {loading ? (
              <FileSpreadsheet className="h-7 w-7 animate-pulse" />
            ) : (
              <Upload className="h-7 w-7" />
            )}
          </div>
          <div>
            <div className="font-medium text-foreground">
              {loading ? "Đang xử lý..." : "Kéo & thả file .xlsx vào đây"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              hoặc nhấn để chọn file từ máy
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
        </label>

        <p className="mt-6 text-xs text-muted-foreground">
          Toàn bộ xử lý chạy ngay trên trình duyệt — file của bạn không được gửi lên máy chủ.
        </p>
      </div>
    </div>
  );
}
