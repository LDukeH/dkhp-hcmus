import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlanner, uniqueSubjects } from "@/lib/planner/store";
import { subjectColor } from "@/lib/planner/color";

export function SubjectSidebar() {
  const { state, dispatch } = usePlanner();
  const [q, setQ] = useState("");
  const subjects = useMemo(() => uniqueSubjects(state), [state]);
  const filtered = subjects.filter(
    (s) =>
      !q ||
      s.tenMH.toLowerCase().includes(q.toLowerCase()) ||
      s.maMH.toLowerCase().includes(q.toLowerCase()),
  );
  const selectedCount = state.activeSubjects.size;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Môn học</h2>
          <Badge variant="secondary" className="font-mono">
            {selectedCount}/{subjects.length}
          </Badge>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm môn học..."
          className="h-8 pl-8 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 flex-1 text-xs"
          onClick={() =>
            dispatch({ type: "SET_SUBJECTS", ids: subjects.map((s) => s.maMH) })
          }
        >
          Chọn tất cả
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 flex-1 text-xs"
          onClick={() => dispatch({ type: "SET_SUBJECTS", ids: [] })}
        >
          Bỏ chọn
        </Button>
      </div>

      <TooltipProvider delayDuration={300}>
        <div className="-mx-1 flex-1 overflow-y-auto pr-1">
          <ul className="space-y-0.5">
            {filtered.map((s) => {
              const checked = state.activeSubjects.has(s.maMH);
              const c = subjectColor(s.maMH);
              return (
                <li key={s.maMH}>
                  <label
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                      checked ? "bg-accent/60" : "",
                    ].join(" ")}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() =>
                        dispatch({ type: "TOGGLE_SUBJECT", maMH: s.maMH })
                      }
                    />
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: c.dot }}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="min-w-0 flex-1 truncate">{s.tenMH}</span>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {s.tenMH} · {s.maMH}
                      </TooltipContent>
                    </Tooltip>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {s.maMH}
                    </span>
                  </label>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-2 py-4 text-center text-xs text-muted-foreground">
                Không có môn nào phù hợp
              </li>
            )}
          </ul>
        </div>
      </TooltipProvider>
    </div>
  );
}
