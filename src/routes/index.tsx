import { createFileRoute } from "@tanstack/react-router";
import { PlannerApp } from "@/components/planner/PlannerApp";

export const Route = createFileRoute("/")({
  component: PlannerApp,
  head: () => ({
    meta: [
      { title: "Trợ lý lập TKB · KHTN ĐHQG-HCM" },
      {
        name: "description",
        content:
          "Tải lên file Excel kế hoạch mở học phần để chọn lớp, kiểm tra trùng lịch và xuất thời khoá biểu cho sinh viên HCMUS.",
      },
    ],
  }),
});
