import { PlannerProvider, usePlanner } from "@/lib/planner/store";
import { Toaster } from "@/components/ui/sonner";
import { Stepper } from "./Stepper";
import { Step1Upload } from "./Step1Upload";
import { Step2Select } from "./Step2Select";
import { Step3Result } from "./Step3Result";

function PlannerInner() {
  const { state } = usePlanner();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
              KHTN
            </div>
            <span className="text-sm font-semibold tracking-tight">Trợ lý lập TKB · ĐHQG-HCM</span>
          </div>
          <Stepper step={state.step} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {state.step === 1 && <Step1Upload />}
        {state.step === 2 && <Step2Select />}
        {state.step === 3 && <Step3Result />}
      </main>
    </div>
  );
}

export function PlannerApp() {
  return (
    <PlannerProvider>
      <PlannerInner />
      <Toaster richColors position="top-right" />
    </PlannerProvider>
  );
}
