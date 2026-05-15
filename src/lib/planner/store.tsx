import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Action, AppState, ClassRow } from "./types";

const initial: AppState = {
  step: 1,
  allClasses: [],
  activeSubjects: new Set(),
  selectedIds: new Set(),
  filters: {
    thu: "all",
    buoi: "all",
    loai: "all",
    khoaHoc: "all",
    hocKy: "all",
    namHoc: "all",
    search: "",
  },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD":
      return { ...initial, allClasses: action.rows, step: 2 };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "TOGGLE_SUBJECT": {
      const s = new Set(state.activeSubjects);
      if (s.has(action.maMH)) s.delete(action.maMH);
      else s.add(action.maMH);
      return { ...state, activeSubjects: s };
    }
    case "SET_SUBJECTS":
      return { ...state, activeSubjects: new Set(action.ids) };
    case "TOGGLE_CLASS": {
      const s = new Set(state.selectedIds);
      if (s.has(action.id)) s.delete(action.id);
      else s.add(action.id);
      return { ...state, selectedIds: s };
    }
    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, [action.key]: action.value } };
    case "RESET":
      return initial;
    default:
      return state;
  }
}

type Ctx = { state: AppState; dispatch: React.Dispatch<Action> };
const PlannerCtx = createContext<Ctx | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <PlannerCtx.Provider value={{ state, dispatch }}>{children}</PlannerCtx.Provider>;
}

export function usePlanner() {
  const c = useContext(PlannerCtx);
  if (!c) throw new Error("usePlanner outside provider");
  return c;
}

export function selectedClasses(state: AppState): ClassRow[] {
  return state.allClasses.filter((c) => state.selectedIds.has(c.id));
}

export function uniqueSubjects(state: AppState): { maMH: string; tenMH: string }[] {
  const m = new Map<string, string>();
  for (const c of state.allClasses) if (!m.has(c.maMH)) m.set(c.maMH, c.tenMH);
  return Array.from(m, ([maMH, tenMH]) => ({ maMH, tenMH })).sort((a, b) =>
    a.tenMH.localeCompare(b.tenMH, "vi"),
  );
}

export function uniqueValues(state: AppState, key: keyof ClassRow): string[] {
  const s = new Set<string>();
  for (const c of state.allClasses) {
    const v = c[key];
    if (v != null && v !== "") s.add(String(v));
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b, "vi"));
}
