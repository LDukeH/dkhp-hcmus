import { forwardRef, useMemo } from "react";
import { usePlanner, selectedClasses } from "@/lib/planner/store";
import { subjectColor } from "@/lib/planner/color";
import {
  hasConflict,
  THEORY_PERIOD_MAP,
  getOccupiedPeriods,
  periodNumeric,
  isPracticalType,
  PRACTICAL_SLOT_MAP,
  LOAI_LABEL,
} from "@/lib/planner/schedule";
import type { ClassRow } from "@/lib/planner/types";

const DAYS = ["2", "3", "4", "5", "6", "7"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const ROW_HEIGHT = 64;

function getPlacement(c: ClassRow) {
  if (isPracticalType(c.loaiLop) && c.tietBatDau != null) {
    const slot = PRACTICAL_SLOT_MAP[String(c.tietBatDau)];
    if (slot) {
      return {
        start: slot.firstPeriod,
        span: 3,
      };
    }
  }

  const periods = getOccupiedPeriods(c)
    .map(periodNumeric)
    .filter((n) => Number.isFinite(n));

  if (!periods.length) return null;

  const start = Math.min(...periods);
  const end = Math.max(...periods);

  return {
    start,
    span: end - start + 1,
  };
}

export const SchedulePreview = forwardRef<HTMLDivElement>(function SchedulePreview(_, ref) {
  const { state, dispatch } = usePlanner();
  const selected = useMemo(() => selectedClasses(state), [state]);

  return (
    <div
      ref={ref}
      className="rounded-lg border bg-card p-4"
      style={{ fontFamily: "system-ui, Inter, sans-serif" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Thời khoá biểu tuần</h3>
        <span className="text-xs text-muted-foreground">{selected.length} lớp</span>
      </div>

      <div
        className="grid gap-1 text-xs"
        style={{
          gridTemplateColumns: "100px repeat(6, minmax(140px, 1fr))",
        }}
      >
        <div />

        {DAYS.map((d) => (
          <div
            key={d}
            className="rounded-md bg-muted px-2 py-1.5 text-center font-semibold text-foreground"
          >
            Thứ {d}
          </div>
        ))}

        <div className="flex flex-col gap-1">
          {PERIODS.map((p) => (
            <div
              key={p}
              className="flex flex-col items-end justify-start rounded-md bg-muted/40 px-2 py-1.5 text-right"
              style={{ height: ROW_HEIGHT }}
            >
              <span className="font-medium text-foreground">Tiết {p}</span>
              <span className="text-[10px] text-muted-foreground">`{THEORY_PERIOD_MAP[p]}`</span>
            </div>
          ))}
        </div>

        {DAYS.map((day) => (
          <DayColumn key={day} day={day} selected={selected} dispatch={dispatch} />
        ))}
      </div>

      {selected.length === 0 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {"Chưa có lớp nào được chọn."}
        </p>
      )}
    </div>
  );
});

type DayColumnProps = {
  day: string;
  selected: ClassRow[];
};

function DayColumn({ day, selected }: DayColumnProps) {
  const classes = selected.filter((c) => String(c.thu) === day);

  return (
    <div
      className="relative rounded-md border border-dashed border-border/60 bg-background"
      style={{ height: PERIODS.length * ROW_HEIGHT }}
    >
      {PERIODS.map((p) => (
        <div
          key={p}
          className="border-b border-border/40 last:border-b-0"
          style={{ height: ROW_HEIGHT }}
        />
      ))}

      {classes.map((c, index) => {
        const placement = getPlacement(c);
        if (!placement) return null;

        const color = subjectColor(c.maMH);
        const conflicting = selected.some((o) => o.id !== c.id && hasConflict(c, o));

        return (
          <div
            key={c.id}
            className="absolute overflow-hidden rounded-md border px-2 py-1 text-[10px] leading-tight shadow-sm"
            style={{
              top: (placement.start - 1) * ROW_HEIGHT + 4,
              height: placement.span * ROW_HEIGHT - 8,
              left: conflicting ? 4 + (index % 2) * 18 : 4,
              right: conflicting ? 4 : 4,
              backgroundColor: color.bg,
              borderColor: color.border,
              color: color.text,
              zIndex: conflicting ? 20 + index : 10,
            }}
          >
            <div className="font-semibold line-clamp-2">{c.tenMH}</div>
            <div className="font-mono text-[9px] opacity-80">
              {c.lop} · {LOAI_LABEL[c.loaiLop] ?? c.loaiLop}
            </div>
            {c.phong && <div className="text-[9px] opacity-80">P: {c.phong}</div>}
            {c.tenGV && <div className="text-[9px] opacity-80">GV: {c.tenGV}</div>}

            {conflicting && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(220,38,38,0.18) 0 6px, transparent 6px 12px)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
