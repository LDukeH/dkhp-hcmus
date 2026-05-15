import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePlanner } from "@/lib/planner/store";
import { SubjectSidebar } from "./SubjectSidebar";
import { ClassTable } from "./ClassTable";
import { SchedulePreview } from "./SchedulePreview";
import { exportNodeAsPng } from "@/lib/planner/exportPng";
import { toast } from "sonner";

export function Step2Select() {
  const { dispatch } = usePlanner();
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

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

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-4 h-[calc(100vh-7rem)] rounded-lg border bg-card p-3">
          <SubjectSidebar />
        </div>
      </aside>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <Menu className="mr-1 h-4 w-4" />
                Môn học
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-4">
              <SheetHeader>
                <SheetTitle>Môn học</SheetTitle>
              </SheetHeader>
              <div className="mt-3 h-[calc(100vh-6rem)]">
                <SubjectSidebar />
              </div>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "SET_STEP", step: 1 })}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Tải lại file
            </Button>
            <Button size="sm" onClick={() => dispatch({ type: "SET_STEP", step: 3 })}>
              Tiếp tục
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        <ClassTable />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Xem trước thời khoá biểu</h2>
          <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting}>
            <Download className="mr-1 h-4 w-4" />
            {exporting ? "Đang xuất..." : "Xuất ảnh (PNG)"}
          </Button>
        </div>
        <SchedulePreview ref={previewRef} />
      </div>
    </div>
  );
}
