export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Tải file" },
    { n: 2, label: "Chọn lớp" },
    { n: 3, label: "Kết quả" },
  ];
  return (
    <div className="flex items-center gap-2 text-sm">
      {steps.map((s, i) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={[
                "flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : done
                    ? "bg-accent text-primary"
                    : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold",
                  active
                    ? "bg-primary-foreground/20"
                    : done
                      ? "bg-primary/15"
                      : "bg-background/60",
                ].join(" ")}
              >
                {s.n}
              </span>
              <span className="font-medium">Bước {s.n} · {s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <span className="text-muted-foreground">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
